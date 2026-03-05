import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { ParcelasController } from './parcelas.controller';
import { SalesService } from './sales.service';

@Module({
    controllers: [SalesController, ParcelasController],
    providers: [SalesService],
    exports: [SalesService],
})
export class SalesModule { }
