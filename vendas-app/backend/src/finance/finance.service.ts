import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) { }

    async getSummary() {
        const hoje = new Date();
        const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const fimDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

        const [pendentesHoje, vencidas, totalPendentes, pagosMes] = await Promise.all([
            this.prisma.parcela.aggregate({
                where: {
                    status: 'PENDENTE',
                    dataVencimento: { gte: inicioDia, lte: fimDoDia },
                    venda: { status: 'CONCLUIDA' }
                },
                _sum: { valor: true },
                _count: true
            }),
            this.prisma.parcela.aggregate({
                where: {
                    status: 'PENDENTE',
                    dataVencimento: { lt: inicioDia },
                    venda: { status: 'CONCLUIDA' }
                },
                _sum: { valor: true },
                _count: true
            }),
            this.prisma.parcela.aggregate({
                where: {
                    status: 'PENDENTE',
                    venda: { status: 'CONCLUIDA' }
                },
                _sum: { valor: true }
            }),
            this.prisma.parcela.aggregate({
                where: {
                    status: 'PAGA',
                    dataPagamento: { gte: inicioMes },
                    venda: { status: 'CONCLUIDA' }
                },
                _sum: { valor: true },
                _count: true
            })
        ]);

        return {
            hoje: {
                total: Number(pendentesHoje._sum.valor || 0),
                count: pendentesHoje._count
            },
            vencidas: {
                total: Number(vencidas._sum.valor || 0),
                count: vencidas._count
            },
            totalGeral: Number(totalPendentes._sum.valor || 0),
            pagosMes: {
                total: Number(pagosMes._sum.valor || 0),
                count: pagosMes._count
            }
        };
    }

    async findAll(query: { status?: string; search?: string; page?: number; limit?: number; order?: 'asc' | 'desc' }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const order = query.order || 'asc';

        const where: any = {
            venda: { status: 'CONCLUIDA' }
        };

        if (query.status) {
            where.status = query.status;
        }

        if (query.search) {
            where.venda.cliente = {
                nome: { contains: query.search, mode: 'insensitive' }
            };
        }

        const [data, total] = await Promise.all([
            this.prisma.parcela.findMany({
                where,
                skip,
                take: limit,
                orderBy: { dataVencimento: order },
                include: {
                    venda: {
                        include: { cliente: true }
                    }
                }
            }),
            this.prisma.parcela.count({ where })
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    async getOverdue() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        return this.prisma.parcela.findMany({
            where: {
                status: 'PENDENTE',
                dataVencimento: { lt: hoje },
                venda: { status: 'CONCLUIDA' }
            },
            orderBy: { dataVencimento: 'asc' },
            include: {
                venda: {
                    include: { cliente: true }
                }
            }
        });
    }

    async pay(id: string) {
        const parcela = await this.prisma.parcela.findUnique({ where: { id } });
        if (!parcela) throw new NotFoundException('Parcela não encontrada');

        return this.prisma.parcela.update({
            where: { id },
            data: {
                status: 'PAGA',
                dataPagamento: new Date()
            }
        });
    }
}
