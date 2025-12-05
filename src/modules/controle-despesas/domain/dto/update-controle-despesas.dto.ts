import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateControleDespesasDto {
  @ApiProperty({
    default: '10.00',
  })
  @IsString()
  @IsOptional()
  saldo?: string;

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
    default: 'Entrada',
  })
  @IsString()
  @IsOptional()
  tipo?: string;
}
