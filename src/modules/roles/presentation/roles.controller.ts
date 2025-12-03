import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateRoleDto } from '../domain/dto/create-role.dto';
import { UpdateRoleDto } from '../domain/dto/update-role.dto';
import { RolesService } from '../services/roles.service';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';

@ApiTags('Roles')
@PermissionsGroup('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('criar_role')
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions('listar_roles')
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('listar_roles_por_id')
  async findOne(@Param('id') id: number) {
    return await this.rolesService.findOne(Number(id));
  }

  @Put(':id')
  @Permissions('atualizar_role')
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions('deletar_role')
  async delete(@Param('id') id: number) {
    return await this.rolesService.delete(id);
  }
}
