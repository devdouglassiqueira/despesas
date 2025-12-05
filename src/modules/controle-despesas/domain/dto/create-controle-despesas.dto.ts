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
}
