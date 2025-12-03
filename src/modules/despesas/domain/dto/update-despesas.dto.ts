import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateDespesasDto {
  @ApiProperty({
    default: '10.00',
  })
  @IsString()
  @IsOptional()
  valor?: string;

  @ApiProperty({
    default: 'Mercado',
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    default: 'Alimentação',
  })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiProperty({
    default: 'Cartão Nubank',
  })
  @IsString()
  @IsOptional()
  formaPagamento?: string;
}
