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

import { CreatePermissionDto } from '../domain/dto/create-permission.dto';
import { UpdatePermissionDto } from '../domain/dto/update-permission.dto';
import { PermissionsService } from '../services/permissions.service';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';

@ApiTags('Permissions')
@PermissionsGroup('Permissões')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions('criar_permissao')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Permissions('listar_permissoes')
  async findAll() {
    return await this.permissionsService.findAll();
  }

  @Put(':id')
  @Permissions('atualizar_permissao')
  async update(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return await this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions('deletar_permissao')
  async delete(@Param('id') id: number) {
    return await this.permissionsService.delete(id);
  }
}
