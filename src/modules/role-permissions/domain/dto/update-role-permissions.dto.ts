import { IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRolePermissionsDto } from './create-role-permissions.dto';

export class UpdateRolePermissionsDto extends PartialType(
  CreateRolePermissionsDto,
) {
  @ApiProperty({
    example: 1,
    description: 'ID do papel (role)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  roleId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID da permissão',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  permissionsId?: number;
}
