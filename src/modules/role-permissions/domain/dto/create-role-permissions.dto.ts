import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolePermissionsDto {
  @ApiProperty({
    example: 1,
    description: 'ID do papel (role)',
  })
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({
    example: 1,
    description: 'ID da permissão',
  })
  @IsNumber()
  @IsNotEmpty()
  permissionsId: number;
}
