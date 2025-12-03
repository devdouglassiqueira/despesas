import { IsOptional, IsString, IsEmail } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateDadosDiscordDto {
  @ApiProperty({
    default: 'Jonh.Doe',
  })
  @IsString()
  @IsOptional()
  operador?: string;

  @ApiProperty({
    default: '(22)99999-9999',
  })
  @IsOptional()
  telefone?: string;

  @ApiProperty({
    default: 'jonh_doe@mail.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    default: '123456',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    default: 'active',
  })
  @IsOptional()
  status?: string;
}
