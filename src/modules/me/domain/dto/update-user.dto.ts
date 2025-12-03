import { IsOptional, IsString, IsEmail } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    default: 'User name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    default: 'user@mail.com',
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
}
