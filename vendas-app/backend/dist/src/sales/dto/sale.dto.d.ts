export declare enum FormaPagamento {
    PIX = "PIX",
    DINHEIRO = "DINHEIRO",
    CARTAO = "CARTAO",
    BOLETO = "BOLETO",
    OUTROS = "OUTROS"
}
export declare class ItemVendaDto {
    produtoId: string;
    quantidade: number;
    valorUnitario: number;
}
export declare class CreateSaleDto {
    clienteId: string;
    formaPagamento: FormaPagamento;
    desconto?: number;
    observacoes?: string;
    itens: ItemVendaDto[];
}
