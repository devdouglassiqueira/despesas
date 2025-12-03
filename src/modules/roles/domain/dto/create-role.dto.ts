import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    default: 'any_name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    default: 'any_description',
  })
  @IsString()
  @IsOptional()
  description: string;
}
