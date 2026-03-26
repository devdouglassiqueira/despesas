import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateControleDespesasDto {
  @ApiProperty({
    default: '10.00',
  })
  @IsString()
  @IsOptional()
  saldo: string;

  @ApiProperty({
    default: '10.00',
  })
  @IsString()
  @IsNotEmpty()
  valor: string;

  @ApiProperty({
    default: 'Mercado',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    default: 'Entrada',
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    default: 'João Silva',
  })
  @IsString()
  @IsOptional()
  contato: string;

  @ApiProperty({
    default: 'Alimentação',
  })
  @IsString()
  @IsOptional()
  categoria: string;

  @ApiProperty({
    example: 'Nao é minha, especificar',
    description: 'Tags da despesa',
  })
  @IsString()
  @IsOptional()
  tags: string;

  @ApiProperty({
    default: '2024-01-01',
  })
  @IsOptional()
  data: Date;
}
