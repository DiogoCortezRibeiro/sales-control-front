import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: { search?: string; page?: number; limit?: number }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { nome: { contains: query.search, mode: 'insensitive' } },
                { telefone: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { cpfCnpj: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.cliente.findMany({
                where,
                skip,
                take: limit,
                orderBy: { nome: 'asc' },
                include: { _count: { select: { vendas: true } } },
            }),
            this.prisma.cliente.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string) {
        const [cliente, totalGasto, parcelasPendentes] = await Promise.all([
            this.prisma.cliente.findUnique({
                where: { id },
                include: {
                    vendas: {
                        orderBy: { dataVenda: 'desc' },
                        take: 10,
                        include: { itens: { include: { produto: true } } },
                    },
                },
            }),
            this.prisma.venda.aggregate({
                where: { clienteId: id, status: 'CONCLUIDA' },
                _sum: { total: true }
            }),
            this.prisma.parcela.findMany({
                where: {
                    venda: { clienteId: id },
                    status: 'PENDENTE'
                },
                orderBy: { dataVencimento: 'asc' },
                include: { venda: { select: { total: true, dataVenda: true } } }
            })
        ]);

        if (!cliente) throw new NotFoundException('Cliente não encontrado');

        return {
            ...cliente,
            totalGasto: Number(totalGasto._sum.total || 0),
            parcelasPendentes
        };
    }

    async create(dto: CreateCustomerDto) {
        return this.prisma.cliente.create({ data: dto });
    }

    async update(id: string, dto: UpdateCustomerDto) {
        await this.findOne(id);
        return this.prisma.cliente.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.cliente.delete({ where: { id } });
    }
}
