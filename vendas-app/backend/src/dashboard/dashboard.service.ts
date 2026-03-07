import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getKpis(query: { dataInicio?: string; dataFim?: string }) {
        const hoje = new Date();
        const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

        const dataInicio = query.dataInicio ? new Date(query.dataInicio) : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const dataFim = query.dataFim ? new Date(query.dataFim) : hoje;
        if (query.dataFim) dataFim.setHours(23, 59, 59, 999);

        const [vendasHoje, vendasMes, totalHoje, totalMes] = await Promise.all([
            this.prisma.venda.count({
                where: { dataVenda: { gte: inicioDia }, status: 'CONCLUIDA' },
            }),
            this.prisma.venda.count({
                where: { dataVenda: { gte: dataInicio, lte: dataFim }, status: 'CONCLUIDA' },
            }),
            this.prisma.venda.aggregate({
                where: { dataVenda: { gte: inicioDia }, status: 'CONCLUIDA' },
                _sum: { total: true },
            }),
            this.prisma.venda.aggregate({
                where: { dataVenda: { gte: dataInicio, lte: dataFim }, status: 'CONCLUIDA' },
                _sum: { total: true },
            }),
        ]);

        const ticketMedioMes = vendasMes > 0
            ? Number(totalMes._sum.total || 0) / vendasMes
            : 0;

        // Produtos com estoque baixo (não depende de data de venda, mas sim de estoque atual)
        const produtosEstoqueBaixo = await this.prisma.$queryRaw<any[]>`
      SELECT id, nome, "estoqueAtual", "estoqueMinimo"
      FROM produtos
      WHERE ativo = true
        AND "estoqueMinimo" IS NOT NULL
        AND "estoqueAtual" <= "estoqueMinimo"
      LIMIT 10
    `;

        // Parcelas atrasadas (independente do filtro de data de venda, mostra o total pendente hoje)
        const hoje_date = new Date();
        const parcelasAtrasadas = await this.prisma.parcela.count({
            where: {
                status: 'PENDENTE',
                dataVencimento: { lt: hoje_date },
                venda: { status: 'CONCLUIDA' }
            }
        });

        // Lucro do período
        const lucroMesRaw = await this.prisma.$queryRaw<any[]>`
            SELECT 
                SUM(iv.quantidade * (iv."valorUnitario" - p.custo)) as lucro
            FROM itens_venda iv
            INNER JOIN produtos p ON p.id = iv."produtoId"
            INNER JOIN vendas v ON v.id = iv."vendaId"
            WHERE v.status = 'CONCLUIDA' 
              AND v."dataVenda" >= ${dataInicio}
              AND v."dataVenda" <= ${dataFim}
        `;

        return {
            vendasHoje,
            vendasMes,
            totalHoje: Number(totalHoje._sum.total || 0),
            totalMes: Number(totalMes._sum.total || 0),
            lucroMes: Number(lucroMesRaw[0]?.lucro || 0),
            ticketMedioMes,
            produtosEstoqueBaixo: produtosEstoqueBaixo.length,
            parcelasAtrasadas,
        };
    }

    async getTopProducts(query: { limit?: number; dataInicio?: string; dataFim?: string }) {
        const limit = Number(query.limit) || 5;
        const start = query.dataInicio ? new Date(query.dataInicio) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = query.dataFim ? new Date(query.dataFim) : new Date();
        if (query.dataFim) end.setHours(23, 59, 59, 999);

        const results = await this.prisma.$queryRaw<any[]>`
      SELECT
        p.id,
        p.nome,
        p.categoria,
        SUM(iv.quantidade)::integer as "totalVendido",
        SUM(iv."totalItem") as "totalReceita",
        SUM(iv.quantidade * (iv."valorUnitario" - p.custo)) as "totalGanho"
      FROM itens_venda iv
      INNER JOIN produtos p ON p.id = iv."produtoId"
      INNER JOIN vendas v ON v.id = iv."vendaId"
      WHERE v.status = 'CONCLUIDA'
        AND v."dataVenda" >= ${start}
        AND v."dataVenda" <= ${end}
      GROUP BY p.id, p.nome, p.categoria
      ORDER BY "totalVendido" DESC
      LIMIT ${limit}
    `;

        return results.map(r => ({
            ...r,
            totalVendido: Number(r.totalVendido),
            totalReceita: Number(r.totalReceita),
            totalGanho: Number(r.totalGanho),
        }));
    }

    async getSalesTimeSeries(query: { dataInicio?: string; dataFim?: string }) {
        const start = query.dataInicio ? new Date(query.dataInicio) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = query.dataFim ? new Date(query.dataFim) : new Date();
        if (query.dataFim) end.setHours(23, 59, 59, 999);

        const results = await this.prisma.$queryRaw<any[]>`
      SELECT
        DATE("dataVenda" AT TIME ZONE 'America/Sao_Paulo') as data,
        COUNT(*)::integer as "qtdVendas",
        SUM(total) as "totalVendas"
      FROM vendas
      WHERE status = 'CONCLUIDA'
        AND "dataVenda" >= ${start}
        AND "dataVenda" <= ${end}
      GROUP BY DATE("dataVenda" AT TIME ZONE 'America/Sao_Paulo')
      ORDER BY data ASC
    `;

        return results.map(r => ({
            data: r.data,
            qtdVendas: Number(r.qtdVendas),
            totalVendas: Number(r.totalVendas),
        }));
    }

    async getPaymentMethodBreakdown(query: { dataInicio?: string; dataFim?: string }) {
        const start = query.dataInicio ? new Date(query.dataInicio) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = query.dataFim ? new Date(query.dataFim) : new Date();
        if (query.dataFim) end.setHours(23, 59, 59, 999);

        const results = await this.prisma.venda.groupBy({
            by: ['formaPagamento'],
            where: { status: 'CONCLUIDA', dataVenda: { gte: start, lte: end } },
            _count: { _all: true },
            _sum: { total: true },
        });

        return results.map(r => ({
            formaPagamento: r.formaPagamento,
            quantidade: r._count._all,
            total: Number(r._sum.total || 0),
        }));
    }

    async getTopCustomers(query: { limit?: number; dataInicio?: string; dataFim?: string }) {
        const limit = Number(query.limit) || 5;
        const start = query.dataInicio ? new Date(query.dataInicio) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = query.dataFim ? new Date(query.dataFim) : new Date();
        if (query.dataFim) end.setHours(23, 59, 59, 999);

        const results = await this.prisma.$queryRaw<any[]>`
            SELECT
                c.id,
                c.nome,
                COUNT(v.id)::integer as "qtdVendas",
                SUM(v.total) as "totalGasto"
            FROM vendas v
            INNER JOIN clientes c ON c.id = v."clienteId"
            WHERE v.status = 'CONCLUIDA'
              AND v."dataVenda" >= ${start}
              AND v."dataVenda" <= ${end}
            GROUP BY c.id, c.nome
            ORDER BY "totalGasto" DESC
            LIMIT ${limit}
        `;

        return results.map(r => ({
            ...r,
            qtdVendas: Number(r.qtdVendas),
            totalGasto: Number(r.totalGasto),
        }));
    }
}
