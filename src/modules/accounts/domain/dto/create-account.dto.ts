import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsHexColor } from 'class-validator';

export class CreateAccountDto {
    @ApiProperty({ description: 'Nome da conta', example: 'Carteira Principal' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Tipo da conta', example: 'wallet', enum: ['wallet', 'bank', 'credit_card', 'investment', 'other'] })
    @IsEnum(['wallet', 'bank', 'credit_card', 'investment', 'other'])
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: 'Saldo inicial', example: 1000.00 })
    @IsNumber()
    @IsOptional()
    initialBalance?: number;

    @ApiProperty({ description: 'Cor da conta', example: '#3f51b5' })
    @IsHexColor()
    @IsOptional()
    color?: string;
}

export class UpdateAccountDto extends PartialType(CreateAccountDto) { }
