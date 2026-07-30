import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    default: 'Jonh Doe',
  })
  @IsString()
  @IsOptional()
  @Length(2, 150)
  name?: string;

  @ApiProperty({
    default: 'jonh_doe',
  })
  @IsString()
  @IsOptional()
  @Length(3, 50)
  username?: string;

  @ApiProperty({
    default: 'jonh_doe@mail.com',
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(254)
  email?: string;

  @ApiProperty({
    default: '123456',
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @ApiProperty({
    default: '23/09/1999',
  })
  @IsOptional()
  @IsString()
  birthday?: string;

  @ApiProperty({
    default: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiProperty({
    default: 'http://avatar-url.com',
  })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  avatarUrl?: string;

  @ApiProperty({
    example: '1',
    description: 'Role Id',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  roleId?: number;
}
