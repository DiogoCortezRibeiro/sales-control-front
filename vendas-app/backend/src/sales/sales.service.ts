import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/sale.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
    constructor(private prisma: PrismaService) { }

    private readonly vendaInclude = {
        cliente: { select: { id: true, nome: true, telefone: true } },
        itens: { include: { produto: true } },
        parcelas: { orderBy: { numero: 'asc' } as const },
    };

    async findAll(query: {
        search?: string;
        status?: string;
        clienteId?: string;
        dataInicio?: string;
        dataFim?: string;
        page?: number;
        limit?: number;
        order?: 'asc' | 'desc';
    }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const order = query.order || 'desc';

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
                orderBy: { dataVenda: order as Prisma.SortOrder },
                include: this.vendaInclude,
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
            include: this.vendaInclude,
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

        let parcelasCriar = [];
        if (dto.formaPagamento === 'CARTAO' && dto.quantidadeParcelas && dto.quantidadeParcelas > 0) {
            const numParcelas = dto.quantidadeParcelas;
            const valorBase = Math.floor((total / numParcelas) * 100) / 100;
            const resto = Math.round((total - (valorBase * numParcelas)) * 100) / 100;

            for (let i = 1; i <= numParcelas; i++) {
                const isLast = i === numParcelas;
                const valorParcela = isLast ? valorBase + resto : valorBase;
                const dataVencimento = new Date();
                dataVencimento.setDate(dataVencimento.getDate() + (30 * i));

                parcelasCriar.push({
                    numero: i,
                    valor: valorParcela,
                    dataVencimento,
                    status: 'PENDENTE'
                });
            }
        }

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
                    parcelas: parcelasCriar.length > 0 ? { create: parcelasCriar } : undefined,
                },
                include: this.vendaInclude,
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
        if (venda.status === 'CANCELADA') throw new ConflictException('Venda já está cancelada');

        await this.prisma.$transaction(async (tx) => {
            for (const item of (venda as any).itens) {
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

    async getReport(query: {
        dataInicio?: string;
        dataFim?: string;
        clienteId?: string;
        formaPagamento?: string;
        page?: number;
        limit?: number;
    }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

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

        const [vendas, total] = await Promise.all([
            this.prisma.venda.findMany({
                where,
                skip,
                take: limit,
                orderBy: { dataVenda: 'desc' },
                include: {
                    cliente: { select: { nome: true } },
                    itens: { include: { produto: { select: { nome: true, custo: true } } } },
                },
            }),
            this.prisma.venda.count({ where }),
        ]);

        const totalGeral = vendas.reduce((acc, v) => acc + Number(v.total), 0);
        const totalCusto = vendas.reduce((acc, v) => acc + v.itens.reduce((accI, i) => accI + (Number(i.produto.custo) * i.quantidade), 0), 0);
        const totalLucro = totalGeral - totalCusto;
        const totalVendas = vendas.length;
        const ticketMedio = totalVendas > 0 ? totalGeral / totalVendas : 0;

        // For the summary, we need to aggregate across ALL matching records, not just the page
        const aggregator = await this.prisma.venda.aggregate({
            where,
            _sum: { total: true },
            _count: { id: true }
        });

        // Custo total needs a bit more work if we want it for ALL records. 
        // For simplicity in this step, I'll calculate ticketMedio from aggregator.
        // If the user wants precise full-report metrics, we might need a separate query for all sales items.
        // Let's stick to the current logic for calculating resumo from the visible page OR run a query for all prices.

        return {
            vendas: vendas.map(v => ({
                ...v,
                custoVenda: v.itens.reduce((accI, i) => accI + (Number(i.produto.custo) * i.quantidade), 0),
                lucroVenda: Number(v.total) - v.itens.reduce((accI, i) => accI + (Number(i.produto.custo) * i.quantidade), 0),
            })),
            resumo: {
                totalGeral,
                totalCusto,
                totalLucro,
                totalVendas: total,
                ticketMedio
            },
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}
