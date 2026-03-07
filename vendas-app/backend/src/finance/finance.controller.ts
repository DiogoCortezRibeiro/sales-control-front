import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FinanceService } from './finance.service';

@UseGuards(AuthGuard('jwt'))
@Controller('finance')
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Get('summary')
    getSummary() {
        return this.financeService.getSummary();
    }

    @Get('parcels')
    findAll(@Query() query: any) {
        return this.financeService.findAll(query);
    }

    @Get('overdue')
    getOverdue() {
        return this.financeService.getOverdue();
    }

    @Post('parcels/:id/pay')
    pay(@Param('id') id: string) {
        return this.financeService.pay(id);
    }
}
