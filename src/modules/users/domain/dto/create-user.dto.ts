import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    default: 'Jonh Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    default: 'jonh_doe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

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
    default: '23/09/1999',
  })
  @IsNotEmpty()
  birthday: string;

  @ApiProperty({
    default: 'active',
  })
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    example: '1',
    description: 'Role Id',
  })
  @IsNotEmpty()
  roleId: number;
}
