import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({
    default: 'user@mail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    default: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
