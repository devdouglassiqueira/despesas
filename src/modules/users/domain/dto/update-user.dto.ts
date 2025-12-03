import { IsOptional, IsString, IsEmail } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    default: 'Jonh Doe',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    default: 'jonh_doe',
  })
  @IsString()
  @IsOptional()
  username?: string;

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
    default: '23/09/1999',
  })
  @IsOptional()
  birthday?: string;

  @ApiProperty({
    default: 'active',
  })
  @IsOptional()
  status?: string;

  @ApiProperty({
    default: 'http://avatar-url.com',
  })
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    example: '1',
    description: 'Role Id',
  })
  @IsOptional()
  roleId: number;
}
