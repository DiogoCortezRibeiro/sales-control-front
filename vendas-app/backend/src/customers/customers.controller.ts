import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('customers')
export class CustomersController {
    constructor(private customersService: CustomersService) { }

    @Get()
    findAll(@Query() query: any) {
        return this.customersService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateCustomerDto) {
        return this.customersService.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
        return this.customersService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.customersService.remove(id);
    }
}
