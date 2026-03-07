import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('kpis')
    getKpis(@Query() query: any) {
        return this.dashboardService.getKpis(query);
    }

    @Get('top-products')
    getTopProducts(@Query() query: any) {
        return this.dashboardService.getTopProducts(query);
    }

    @Get('sales-series')
    getSalesTimeSeries(@Query() query: any) {
        return this.dashboardService.getSalesTimeSeries(query);
    }

    @Get('payment-breakdown')
    getPaymentMethodBreakdown(@Query() query: any) {
        return this.dashboardService.getPaymentMethodBreakdown(query);
    }

    @Get('top-customers')
    getTopCustomers(@Query() query: any) {
        return this.dashboardService.getTopCustomers(query);
    }
}
