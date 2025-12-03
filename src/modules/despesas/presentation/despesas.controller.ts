import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateDespesasDto } from '../domain/dto/create-despesas.dto';
import { UpdateDespesasDto } from '../domain/dto/update-despesas.dto';
import { DespesasService } from '../services/despesas.service';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';

@ApiTags('Despesas')
@PermissionsGroup('Despesas')
@Controller('despesas')
export class DespesasController {
  constructor(private readonly despesasService: DespesasService) {}

  @Post()
  @Permissions('criar_despesas')
  async create(@Body() createDespesasRequest: CreateDespesasDto) {
    return await this.despesasService.create(createDespesasRequest);
  }

  @Get()
  @Permissions('listar_despesas')
  async findAll() {
    return await this.despesasService.findAll();
  }
  @Get('filtros')
  @Permissions('listar_despesas_filtros')
  async findAllFilter() {
    return this.despesasService.findAllFilter();
  }

  @Get(':id')
  @Permissions('listar_despesas_por_id')
  async findOne(@Param('id') id: string) {
    return await this.despesasService.findOne(+id);
  }

  @Put(':id')
  @Permissions('atualizar_despesas')
  async update(
    @Param('id') id: string,
    @Body() updateDespesasRequest: UpdateDespesasDto,
  ) {
    const despesas = await this.despesasService.update(
      +id,
      updateDespesasRequest,
    );

    return {
      id: despesas.id,
      valor: despesas.valor,
      descricao: despesas.descricao,
    };
  }

  @Delete(':id')
  @Permissions('deletar_despesas')
  async delete(@Param('id') id: string) {
    return await this.despesasService.delete(+id);
  }
}
