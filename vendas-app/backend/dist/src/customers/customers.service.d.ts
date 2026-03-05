import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            _count: {
                vendas: number;
            };
        } & {
            id: string;
            email: string | null;
            nome: string;
            createdAt: Date;
            updatedAt: Date;
            telefone: string;
            cpfCnpj: string | null;
            endereco: string | null;
            observacoes: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        vendas: ({
            itens: ({
                produto: {
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
                };
            } & {
                id: string;
                vendaId: string;
                produtoId: string;
                quantidade: number;
                valorUnitario: import("@prisma/client/runtime/library").Decimal;
                totalItem: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            observacoes: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            dataVenda: Date;
            clienteId: string;
            formaPagamento: import(".prisma/client").$Enums.FormaPagamento;
            status: import(".prisma/client").$Enums.StatusVenda;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            desconto: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        email: string | null;
        nome: string;
        createdAt: Date;
        updatedAt: Date;
        telefone: string;
        cpfCnpj: string | null;
        endereco: string | null;
        observacoes: string | null;
    }>;
    create(dto: CreateCustomerDto): Promise<{
        id: string;
        email: string | null;
        nome: string;
        createdAt: Date;
        updatedAt: Date;
        telefone: string;
        cpfCnpj: string | null;
        endereco: string | null;
        observacoes: string | null;
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<{
        id: string;
        email: string | null;
        nome: string;
        createdAt: Date;
        updatedAt: Date;
        telefone: string;
        cpfCnpj: string | null;
        endereco: string | null;
        observacoes: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string | null;
        nome: string;
        createdAt: Date;
        updatedAt: Date;
        telefone: string;
        cpfCnpj: string | null;
        endereco: string | null;
        observacoes: string | null;
    }>;
}
