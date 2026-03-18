import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsHexColor, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ description: 'Nome da categoria' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Cor em formato HEX', example: '#FF5733' })
    @IsHexColor()
    @IsOptional()
    color?: string;

    @ApiProperty({ description: 'Nome do ícone (Material Icons)', example: 'home' })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiProperty({ description: 'Tipo da categoria: income ou expense', example: 'expense' })
    @IsEnum(['income', 'expense'])
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: 'ID da categoria pai', required: false, example: 1 })
    @IsNumber()
    @IsOptional()
    parentId?: number;
}

export class UpdateCategoryDto extends CreateCategoryDto { }
