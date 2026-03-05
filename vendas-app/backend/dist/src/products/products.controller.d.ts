import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(query: any): Promise<{
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
}
