import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    default: 'Jonh Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  name: string;

  @ApiProperty({
    default: 'jonh_doe',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @ApiProperty({
    default: 'jonh_doe@mail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    default: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({
    default: '23/09/1999',
  })
  @IsNotEmpty()
  @IsString()
  birthday: string;

  @ApiProperty({
    default: 'active',
  })
  @IsNotEmpty()
  @IsIn(['active', 'inactive'])
  status: string;

  @ApiProperty({
    example: '1',
    description: 'Role Id',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  roleId: number;
}
