import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: {
        search?: string;
        ativo?: string;
        page?: number;
        limit?: number;
    }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { nome: { contains: query.search, mode: 'insensitive' } },
                { sku: { contains: query.search, mode: 'insensitive' } },
                { categoria: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.ativo !== undefined) {
            where.ativo = query.ativo === 'true';
        }

        const [data, total] = await Promise.all([
            this.prisma.produto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { nome: 'asc' },
            }),
            this.prisma.produto.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string) {
        const produto = await this.prisma.produto.findUnique({ where: { id } });
        if (!produto) throw new NotFoundException('Produto não encontrado');
        return produto;
    }

    async create(dto: CreateProductDto) {
        const exists = await this.prisma.produto.findUnique({ where: { sku: dto.sku } });
        if (exists) throw new ConflictException('SKU já cadastrado');

        return this.prisma.produto.create({ data: dto });
    }

    async update(id: string, dto: UpdateProductDto) {
        await this.findOne(id);
        return this.prisma.produto.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        // Desativar em vez de deletar (exclusão lógica)
        return this.prisma.produto.update({
            where: { id },
            data: { ativo: false },
        });
    }

    async getLowStock() {
        return this.prisma.produto.findMany({
            where: {
                ativo: true,
                estoqueMinimo: { not: null },
                estoqueAtual: { lte: this.prisma.produto.fields.estoqueMinimo as any },
            },
        });
    }
}
