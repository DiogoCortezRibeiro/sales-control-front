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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKpis() {
        const hoje = new Date();
        const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const [vendasHoje, vendasMes, totalHoje, totalMes] = await Promise.all([
            this.prisma.venda.count({
                where: { dataVenda: { gte: inicioDia }, status: 'CONCLUIDA' },
            }),
            this.prisma.venda.count({
                where: { dataVenda: { gte: inicioMes }, status: 'CONCLUIDA' },
            }),
            this.prisma.venda.aggregate({
                where: { dataVenda: { gte: inicioDia }, status: 'CONCLUIDA' },
                _sum: { total: true },
            }),
            this.prisma.venda.aggregate({
                where: { dataVenda: { gte: inicioMes }, status: 'CONCLUIDA' },
                _sum: { total: true },
            }),
        ]);
        const ticketMedioMes = vendasMes > 0
            ? Number(totalMes._sum.total || 0) / vendasMes
            : 0;
        const produtosEstoqueBaixo = await this.prisma.$queryRaw `
      SELECT id, nome, sku, "estoqueAtual", "estoqueMinimo"
      FROM produtos
      WHERE ativo = true
        AND "estoqueMinimo" IS NOT NULL
        AND "estoqueAtual" <= "estoqueMinimo"
      LIMIT 10
    `;
        return {
            vendasHoje,
            vendasMes,
            totalHoje: Number(totalHoje._sum.total || 0),
            totalMes: Number(totalMes._sum.total || 0),
            ticketMedioMes,
            produtosEstoqueBaixo: produtosEstoqueBaixo.length,
        };
    }
    async getTopProducts(limit = 5) {
        const results = await this.prisma.$queryRaw `
      SELECT
        p.id,
        p.nome,
        p.sku,
        p.categoria,
        SUM(iv.quantidade)::integer as "totalVendido",
        SUM(iv."totalItem") as "totalReceita"
      FROM itens_venda iv
      INNER JOIN produtos p ON p.id = iv."produtoId"
      INNER JOIN vendas v ON v.id = iv."vendaId"
      WHERE v.status = 'CONCLUIDA'
      GROUP BY p.id, p.nome, p.sku, p.categoria
      ORDER BY "totalVendido" DESC
      LIMIT ${limit}
    `;
        return results.map(r => ({
            ...r,
            totalVendido: Number(r.totalVendido),
            totalReceita: Number(r.totalReceita),
        }));
    }
    async getSalesTimeSeries(days = 30) {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - days);
        dataInicio.setHours(0, 0, 0, 0);
        const results = await this.prisma.$queryRaw `
      SELECT
        DATE("dataVenda" AT TIME ZONE 'America/Sao_Paulo') as data,
        COUNT(*)::integer as "qtdVendas",
        SUM(total) as "totalVendas"
      FROM vendas
      WHERE status = 'CONCLUIDA'
        AND "dataVenda" >= ${dataInicio}
      GROUP BY DATE("dataVenda" AT TIME ZONE 'America/Sao_Paulo')
      ORDER BY data ASC
    `;
        return results.map(r => ({
            data: r.data,
            qtdVendas: Number(r.qtdVendas),
            totalVendas: Number(r.totalVendas),
        }));
    }
    async getPaymentMethodBreakdown() {
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const results = await this.prisma.venda.groupBy({
            by: ['formaPagamento'],
            where: { status: 'CONCLUIDA', dataVenda: { gte: inicioMes } },
            _count: { _all: true },
            _sum: { total: true },
        });
        return results.map(r => ({
            formaPagamento: r.formaPagamento,
            quantidade: r._count._all,
            total: Number(r._sum.total || 0),
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map