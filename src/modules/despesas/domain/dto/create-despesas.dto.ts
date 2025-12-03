import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateDespesasDto {
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
    default: 'Alimentação',
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    default: 'Cartão Nubank',
  })
  @IsString()
  @IsNotEmpty()
  formaPagamento: string;
}
