"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SalesService = class SalesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.clienteId)
            where.clienteId = query.clienteId;
        if (query.dataInicio || query.dataFim) {
            where.dataVenda = {};
            if (query.dataInicio)
                where.dataVenda.gte = new Date(query.dataInicio);
            if (query.dataFim) {
                const fim = new Date(query.dataFim);
                fim.setHours(23, 59, 59, 999);
                where.dataVenda.lte = fim;
            }
        }
        if (query.search) {
            where.OR = [
                { cliente: { nome: { contains: query.search, mode: 'insensitive' } } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.venda.findMany({
                where,
                skip,
                take: limit,
                orderBy: { dataVenda: 'desc' },
                include: {
                    cliente: { select: { id: true, nome: true, telefone: true } },
                    itens: { include: { produto: { select: { id: true, nome: true, sku: true } } } },
                },
            }),
            this.prisma.venda.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const venda = await this.prisma.venda.findUnique({
            where: { id },
            include: {
                cliente: true,
                itens: { include: { produto: true } },
            },
        });
        if (!venda)
            throw new common_1.NotFoundException('Venda não encontrada');
        return venda;
    }
    async create(dto) {
        const cliente = await this.prisma.cliente.findUnique({ where: { id: dto.clienteId } });
        if (!cliente)
            throw new common_1.NotFoundException('Cliente não encontrado');
        const produtosMap = new Map();
        for (const item of dto.itens) {
            const produto = await this.prisma.produto.findUnique({ where: { id: item.produtoId } });
            if (!produto)
                throw new common_1.NotFoundException(`Produto ${item.produtoId} não encontrado`);
            if (!produto.ativo)
                throw new common_1.BadRequestException(`Produto "${produto.nome}" está inativo`);
            if (produto.estoqueAtual < item.quantidade) {
                throw new common_1.BadRequestException(`Estoque insuficiente para "${produto.nome}". Disponível: ${produto.estoqueAtual}, Solicitado: ${item.quantidade}`);
            }
            produtosMap.set(item.produtoId, produto);
        }
        const subtotal = dto.itens.reduce((acc, item) => acc + item.valorUnitario * item.quantidade, 0);
        const desconto = dto.desconto || 0;
        const total = subtotal - desconto;
        const venda = await this.prisma.$transaction(async (tx) => {
            const novaVenda = await tx.venda.create({
                data: {
                    clienteId: dto.clienteId,
                    formaPagamento: dto.formaPagamento,
                    status: 'CONCLUIDA',
                    subtotal,
                    desconto,
                    total,
                    observacoes: dto.observacoes,
                    itens: {
                        create: dto.itens.map((item) => ({
                            produtoId: item.produtoId,
                            quantidade: item.quantidade,
                            valorUnitario: item.valorUnitario,
                            totalItem: item.valorUnitario * item.quantidade,
                        })),
                    },
                },
                include: {
                    cliente: true,
                    itens: { include: { produto: true } },
                },
            });
            for (const item of dto.itens) {
                await tx.produto.update({
                    where: { id: item.produtoId },
                    data: { estoqueAtual: { decrement: item.quantidade } },
                });
            }
            return novaVenda;
        });
        return venda;
    }
    async cancel(id) {
        const venda = await this.findOne(id);
        if (venda.status === 'CANCELADA') {
            throw new common_1.ConflictException('Venda já está cancelada');
        }
        await this.prisma.$transaction(async (tx) => {
            for (const item of venda.itens) {
                await tx.produto.update({
                    where: { id: item.produtoId },
                    data: { estoqueAtual: { increment: item.quantidade } },
                });
            }
            await tx.venda.update({
                where: { id },
                data: { status: 'CANCELADA' },
            });
        });
        return { message: 'Venda cancelada e estoque devolvido com sucesso' };
    }
    async getReport(query) {
        const where = { status: 'CONCLUIDA' };
        if (query.dataInicio || query.dataFim) {
            where.dataVenda = {};
            if (query.dataInicio)
                where.dataVenda.gte = new Date(query.dataInicio);
            if (query.dataFim) {
                const fim = new Date(query.dataFim);
                fim.setHours(23, 59, 59, 999);
                where.dataVenda.lte = fim;
            }
        }
        if (query.clienteId)
            where.clienteId = query.clienteId;
        if (query.formaPagamento)
            where.formaPagamento = query.formaPagamento;
        const vendas = await this.prisma.venda.findMany({
            where,
            orderBy: { dataVenda: 'desc' },
            include: {
                cliente: { select: { nome: true } },
                itens: { include: { produto: { select: { nome: true, sku: true } } } },
            },
        });
        const totalGeral = vendas.reduce((acc, v) => acc + Number(v.total), 0);
        const totalVendas = vendas.length;
        const ticketMedio = totalVendas > 0 ? totalGeral / totalVendas : 0;
        return {
            vendas,
            resumo: { totalGeral, totalVendas, ticketMedio },
        };
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map