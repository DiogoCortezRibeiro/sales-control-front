import {
    Controller, Get, Post, Param, Body, Query, UseGuards, Delete
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sale.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('sales')
export class SalesController {
    constructor(private salesService: SalesService) { }

    @Get()
    findAll(@Query() query: any) {
        return this.salesService.findAll(query);
    }

    @Get('report')
    getReport(@Query() query: any) {
        return this.salesService.getReport(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateSaleDto) {
        return this.salesService.create(dto);
    }

    @Delete(':id/cancel')
    cancel(@Param('id') id: string) {
        return this.salesService.cancel(id);
    }
}
