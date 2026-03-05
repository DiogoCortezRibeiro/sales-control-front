import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sale.dto';
export declare class SalesController {
    private salesService;
    constructor(salesService: SalesService);
    findAll(query: any): Promise<{
        data: ({
            cliente: {
                id: string;
                nome: string;
                telefone: string;
            };
            itens: ({
                produto: {
                    id: string;
                    nome: string;
                    sku: string;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getReport(query: any): Promise<{
        vendas: ({
            cliente: {
                nome: string;
            };
            itens: ({
                produto: {
                    nome: string;
                    sku: string;
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
        resumo: {
            totalGeral: number;
            totalVendas: number;
            ticketMedio: number;
        };
    }>;
    findOne(id: string): Promise<{
        cliente: {
            id: string;
            email: string | null;
            nome: string;
            createdAt: Date;
            updatedAt: Date;
            telefone: string;
            cpfCnpj: string | null;
            endereco: string | null;
            observacoes: string | null;
        };
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
    }>;
    create(dto: CreateSaleDto): Promise<{
        cliente: {
            id: string;
            email: string | null;
            nome: string;
            createdAt: Date;
            updatedAt: Date;
            telefone: string;
            cpfCnpj: string | null;
            endereco: string | null;
            observacoes: string | null;
        };
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
    }>;
    cancel(id: string): Promise<{
        message: string;
    }>;
}
