import { IsString, IsNotEmpty, IsOptional, IsDecimal, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    nome: string;

    @IsNotEmpty()
    @IsString()
    categoria: string;

    @Type(() => Number)
    @IsNotEmpty()
    precoVenda: number;

    @IsNotEmpty()
    @Type(() => Number)
    custo: number;

    @IsOptional()
    @Type(() => Number)
    estoqueAtual?: number;

    @IsOptional()
    @Type(() => Number)
    estoqueMinimo?: number;

    @IsOptional()
    @IsBoolean()
    ativo?: boolean;
}

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    nome?: string;

    @IsOptional()
    @IsString()
    categoria?: string;

    @IsOptional()
    @Type(() => Number)
    precoVenda?: number;

    @IsOptional()
    @Type(() => Number)
    custo?: number;

    @IsOptional()
    @Type(() => Number)
    estoqueAtual?: number;

    @IsOptional()
    @Type(() => Number)
    estoqueMinimo?: number;

    @IsOptional()
    @IsBoolean()
    ativo?: boolean;
}
