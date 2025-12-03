import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    default: 'any_name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    default: 'admin',
    description: 'Grupo da Permissão',
    required: false,
  })
  @IsString()
  @IsOptional()
  group?: string;
}
