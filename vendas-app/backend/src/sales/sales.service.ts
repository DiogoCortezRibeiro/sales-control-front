import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/sale.dto';

@Injectable()
export class SalesService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: {
        search?: string;
        status?: string;
        clienteId?: string;
        dataInicio?: string;
        dataFim?: string;
        page?: number;
        limit?: number;
    }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.status) where.status = query.status;
        if (query.clienteId) where.clienteId = query.clienteId;
        if (query.dataInicio || query.dataFim) {
            where.dataVenda = {};
            if (query.dataInicio) where.dataVenda.gte = new Date(query.dataInicio);
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

    async findOne(id: string) {
        const venda = await this.prisma.venda.findUnique({
            where: { id },
            include: {
                cliente: true,
                itens: { include: { produto: true } },
            },
        });
        if (!venda) throw new NotFoundException('Venda não encontrada');
        return venda;
    }

    async create(dto: CreateSaleDto) {
        // Verificar se cliente existe
        const cliente = await this.prisma.cliente.findUnique({ where: { id: dto.clienteId } });
        if (!cliente) throw new NotFoundException('Cliente não encontrado');

        // Verificar produtos e estoque
        const produtosMap = new Map<string, any>();
        for (const item of dto.itens) {
            const produto = await this.prisma.produto.findUnique({ where: { id: item.produtoId } });
            if (!produto) throw new NotFoundException(`Produto ${item.produtoId} não encontrado`);
            if (!produto.ativo) throw new BadRequestException(`Produto "${produto.nome}" está inativo`);
            if (produto.estoqueAtual < item.quantidade) {
                throw new BadRequestException(
                    `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.estoqueAtual}, Solicitado: ${item.quantidade}`
                );
            }
            produtosMap.set(item.produtoId, produto);
        }

        // Calcular totais
        const subtotal = dto.itens.reduce(
            (acc, item) => acc + item.valorUnitario * item.quantidade,
            0,
        );
        const desconto = dto.desconto || 0;
        const total = subtotal - desconto;

        // Criar venda e itens em transação
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

            // Dar baixa no estoque
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

    async cancel(id: string) {
        const venda = await this.findOne(id);

        if (venda.status === 'CANCELADA') {
            throw new ConflictException('Venda já está cancelada');
        }

        // Devolver estoque e cancelar em transação
        await this.prisma.$transaction(async (tx) => {
            // Devolver estoque
            for (const item of venda.itens) {
                await tx.produto.update({
                    where: { id: item.produtoId },
                    data: { estoqueAtual: { increment: item.quantidade } },
                });
            }

            // Cancelar venda
            await tx.venda.update({
                where: { id },
                data: { status: 'CANCELADA' },
            });
        });

        return { message: 'Venda cancelada e estoque devolvido com sucesso' };
    }

    // Relatório de vendas por período
    async getReport(query: {
        dataInicio?: string;
        dataFim?: string;
        clienteId?: string;
        formaPagamento?: string;
    }) {
        const where: any = { status: 'CONCLUIDA' };
        if (query.dataInicio || query.dataFim) {
            where.dataVenda = {};
            if (query.dataInicio) where.dataVenda.gte = new Date(query.dataInicio);
            if (query.dataFim) {
                const fim = new Date(query.dataFim);
                fim.setHours(23, 59, 59, 999);
                where.dataVenda.lte = fim;
            }
        }
        if (query.clienteId) where.clienteId = query.clienteId;
        if (query.formaPagamento) where.formaPagamento = query.formaPagamento;

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
}
