import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getKpis(): Promise<{
        vendasHoje: number;
        vendasMes: number;
        totalHoje: number;
        totalMes: number;
        ticketMedioMes: number;
        produtosEstoqueBaixo: number;
    }>;
    getTopProducts(limit?: number): Promise<any[]>;
    getSalesTimeSeries(days?: number): Promise<{
        data: any;
        qtdVendas: number;
        totalVendas: number;
    }[]>;
    getPaymentMethodBreakdown(): Promise<{
        formaPagamento: import(".prisma/client").$Enums.FormaPagamento;
        quantidade: number;
        total: number;
    }[]>;
}
