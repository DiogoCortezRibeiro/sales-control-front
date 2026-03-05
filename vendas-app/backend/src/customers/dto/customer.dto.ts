import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCustomerDto {
    @IsNotEmpty()
    @IsString()
    nome: string;

    @IsNotEmpty()
    @IsString()
    telefone: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    cpfCnpj?: string;

    @IsOptional()
    @IsString()
    endereco?: string;

    @IsOptional()
    @IsString()
    observacoes?: string;
}

export class UpdateCustomerDto {
    @IsOptional()
    @IsString()
    nome?: string;

    @IsOptional()
    @IsString()
    telefone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    cpfCnpj?: string;

    @IsOptional()
    @IsString()
    endereco?: string;

    @IsOptional()
    @IsString()
    observacoes?: string;
}
