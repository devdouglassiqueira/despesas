import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
    @ApiProperty({ description: 'Descrição da transação', example: 'Compra no mercado' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Valor da transação', example: 150.50 })
    @IsNumber()
    @IsNotEmpty()
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
    paymentMethod?: string;

    @ApiProperty({ description: 'Data de vencimento', example: '2024-01-10T10:00:00Z' })
    @IsDateString()
    @IsOptional()
    dueDate?: Date;

    @ApiProperty({ description: 'Observações', example: 'Notas adicionais' })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({ description: 'Tags para busca e filtros', example: 'Nao é minha, especificar' })
    @IsString()
    @IsOptional()
    tags?: string;

    @ApiProperty({ description: 'Anexos (URLs)', example: ['https://example.com/file.png'] })
    @IsOptional()
    attachmentUrls?: string[];

    @ApiProperty({ description: 'Número da parcela', example: 1 })
    @IsNumber()
    @IsOptional()
    installmentNumber?: number;

    @ApiProperty({ description: 'Total de parcelas', example: 12 })
    @IsNumber()
    @IsOptional()
    installmentTotal?: number;

    @ApiProperty({ description: 'Se a transação é recorrente', example: false })
    @IsOptional()
    isRecurring?: boolean;

    @ApiProperty({ description: 'ID da transação pai', example: 1 })
    @IsNumber()
    @IsOptional()
    parentId?: number;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) { }
