import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('kpis')
    getKpis() {
        return this.dashboardService.getKpis();
    }

    @Get('top-products')
    getTopProducts(@Query('limit') limit?: number) {
        return this.dashboardService.getTopProducts(limit || 5);
    }

    @Get('sales-series')
    getSalesTimeSeries(@Query('days') days?: number) {
        return this.dashboardService.getSalesTimeSeries(days || 30);
    }

    @Get('payment-breakdown')
    getPaymentMethodBreakdown() {
        return this.dashboardService.getPaymentMethodBreakdown();
    }
}
