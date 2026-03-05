import {
    IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested, IsInt, Min, IsNumber
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FormaPagamento {
    PIX = 'PIX',
    DINHEIRO = 'DINHEIRO',
    CARTAO = 'CARTAO',
    BOLETO = 'BOLETO',
    OUTROS = 'OUTROS',
}

export class ItemVendaDto {
    @IsNotEmpty()
    @IsString()
    produtoId: string;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantidade: number;

    @IsNumber()
    @Type(() => Number)
    valorUnitario: number;
}

export class CreateSaleDto {
    @IsNotEmpty()
    @IsString()
    clienteId: string;

    @IsEnum(FormaPagamento)
    formaPagamento: FormaPagamento;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    desconto?: number;

    @IsOptional()
    @IsString()
    observacoes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemVendaDto)
    itens: ItemVendaDto[];
}
