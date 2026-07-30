import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Length,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateTransactionDto {
    @ApiProperty({ description: 'Descrição da transação', example: 'Compra no mercado' })
    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    description: string;

    @ApiProperty({ description: 'Valor da transação', example: 150.50 })
    @IsNumber()
    @IsNotEmpty()
    @Min(0.01)
    @Max(99999999.99)
    amount: number;

    @ApiProperty({ description: 'Tipo da transação', example: 'expense', enum: ['income', 'expense'] })
    @IsEnum(['income', 'expense'])
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: 'Data da transação', example: '2024-01-01T10:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    date: Date;

    @ApiProperty({ description: 'Status da transação', example: 'paid', enum: ['paid', 'pending'] })
    @IsEnum(['paid', 'pending'])
    @IsOptional()
    status?: string;

    @ApiProperty({ description: 'ID da categoria', example: 1 })
    @IsNumber()
    @IsOptional()
    categoryId?: number;

    @ApiProperty({ description: 'ID da conta', example: 1 })
    @IsNumber()
    @IsOptional()
    accountId?: number;

    @ApiProperty({ description: 'Forma de pagamento', example: 'Credit Card' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    paymentMethod?: string;

    @ApiProperty({ description: 'Data de vencimento', example: '2024-01-10T10:00:00Z' })
    @IsDateString()
    @IsOptional()
    dueDate?: Date;

    @ApiProperty({ description: 'Observações', example: 'Notas adicionais' })
    @IsString()
    @IsOptional()
    @MaxLength(5000)
    notes?: string;

    @ApiProperty({ description: 'Tags para busca e filtros', example: 'Nao é minha, especificar' })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    tags?: string;

    @ApiProperty({ description: 'Anexos (URLs)', example: ['https://example.com/file.png'] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10)
    @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
    attachmentUrls?: string[];

    @ApiProperty({ description: 'Número da parcela', example: 1 })
    @IsInt()
    @Min(1)
    @Max(120)
    @IsOptional()
    installmentNumber?: number;

    @ApiProperty({ description: 'Total de parcelas', example: 12 })
    @IsInt()
    @Min(1)
    @Max(120)
    @IsOptional()
    installmentTotal?: number;

    @ApiProperty({ description: 'Se a transação é recorrente', example: false })
    @IsOptional()
    @IsBoolean()
    isRecurring?: boolean;

    @ApiProperty({ description: 'ID da transação pai', example: 1 })
    @IsInt()
    @Min(1)
    @IsOptional()
    parentId?: number;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) { }
