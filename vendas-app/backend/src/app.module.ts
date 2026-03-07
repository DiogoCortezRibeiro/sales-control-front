import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { SalesModule } from './sales/sales.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProductsModule,
    CustomersModule,
    SalesModule,
    DashboardModule,
    FinanceModule,
  ],
})
export class AppModule { }
