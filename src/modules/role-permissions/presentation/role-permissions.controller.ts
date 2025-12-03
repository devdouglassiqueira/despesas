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

import { CreateRolePermissionsDto } from '../domain/dto/create-role-permissions.dto';
import { UpdateRolePermissionsDto } from '../domain/dto/update-role-permissions.dto';
import { RolePermissionsService } from '../services/role-permissions.service';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';

@ApiTags('Role Permissions')
@PermissionsGroup('Role Permissões')
@Controller('role-permissions')
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Post()
  @Permissions('criar_relacao_role_permissao')
  async create(@Body() createRolePermissionsDto: CreateRolePermissionsDto) {
    return await this.rolePermissionsService.create(createRolePermissionsDto);
  }

  @Post('assign')
  @Permissions('atribuir_permissoes_role')
  async assignPermissions(
    @Body() assignDto: { roleId: number; permissionsIds: number[] },
  ) {
    const { roleId, permissionsIds } = assignDto;
    return await this.rolePermissionsService.assignPermissionsToRole(
      roleId,
      permissionsIds,
    );
  }

  @Put('assign/:roleId')
  @Permissions('atualizar_permissoes_role')
  async updatePermissions(
    @Param('roleId') roleId: number,
    @Body() updateDto: { permissionsIds: number[] },
  ) {
    return await this.rolePermissionsService.updatePermissionsForRole(
      roleId,
      updateDto.permissionsIds,
    );
  }

  @Get()
  @Permissions('listar_relacoes_role_permissao')
  async findAll() {
    return await this.rolePermissionsService.findAll();
  }

  @Put(':id')
  @Permissions('atualizar_relacao_role_permissao')
  async update(
    @Param('id') id: number,
    @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
  ) {
    return await this.rolePermissionsService.update(
      id,
      updateRolePermissionsDto,
    );
  }

  @Delete(':id')
  @Permissions('deletar_relacao_role_permissao')
  async delete(@Param('id') id: number) {
    return await this.rolePermissionsService.delete(id);
  }

  @Post('bulk')
  @Permissions('deletar_relacoes_role_permissao')
  async deleteMany(@Body() deleteDto: { roleId: number; ids: number[] }) {
    return await this.rolePermissionsService.deleteMany(
      deleteDto.roleId,
      deleteDto.ids,
    );
  }
}
