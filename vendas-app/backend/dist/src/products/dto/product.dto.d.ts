export declare class CreateProductDto {
    nome: string;
    sku: string;
    categoria: string;
    precoVenda: number;
    custo?: number;
    estoqueAtual?: number;
    estoqueMinimo?: number;
    ativo?: boolean;
}
export declare class UpdateProductDto {
    nome?: string;
    categoria?: string;
    precoVenda?: number;
    custo?: number;
    estoqueAtual?: number;
    estoqueMinimo?: number;
    ativo?: boolean;
}
