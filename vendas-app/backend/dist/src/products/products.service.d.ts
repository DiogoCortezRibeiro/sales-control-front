import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: {
        search?: string;
        ativo?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            nome: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            categoria: string;
            precoVenda: import("@prisma/client/runtime/library").Decimal;
            custo: import("@prisma/client/runtime/library").Decimal | null;
            estoqueAtual: number;
            estoqueMinimo: number | null;
            ativo: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        nome: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoria: string;
        precoVenda: import("@prisma/client/runtime/library").Decimal;
        custo: import("@prisma/client/runtime/library").Decimal | null;
        estoqueAtual: number;
        estoqueMinimo: number | null;
        ativo: boolean;
    }>;
    create(dto: CreateProductDto): Promise<{
        id: string;
        nome: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoria: string;
        precoVenda: import("@prisma/client/runtime/library").Decimal;
        custo: import("@prisma/client/runtime/library").Decimal | null;
        estoqueAtual: number;
        estoqueMinimo: number | null;
        ativo: boolean;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        id: string;
        nome: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoria: string;
        precoVenda: import("@prisma/client/runtime/library").Decimal;
        custo: import("@prisma/client/runtime/library").Decimal | null;
        estoqueAtual: number;
        estoqueMinimo: number | null;
        ativo: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        nome: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoria: string;
        precoVenda: import("@prisma/client/runtime/library").Decimal;
        custo: import("@prisma/client/runtime/library").Decimal | null;
        estoqueAtual: number;
        estoqueMinimo: number | null;
        ativo: boolean;
    }>;
    getLowStock(): Promise<{
        id: string;
        nome: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        categoria: string;
        precoVenda: import("@prisma/client/runtime/library").Decimal;
        custo: import("@prisma/client/runtime/library").Decimal | null;
        estoqueAtual: number;
        estoqueMinimo: number | null;
        ativo: boolean;
    }[]>;
}
