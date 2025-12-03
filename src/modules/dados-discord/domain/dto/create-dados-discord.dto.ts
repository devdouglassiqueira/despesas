import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateDadosDiscordDto {
  @ApiProperty({
    default: 'Jonh.Doe',
  })
  @IsString()
  @IsNotEmpty()
  operador: string;

  @ApiProperty({
    default: '(22)99999-9999',
  })
  @IsOptional()
  telefone: string;

  @ApiProperty({
    default: 'jonh_doe@mail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    default: '123456',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    default: 'active',
  })
  @IsNotEmpty()
  status: string;
}
