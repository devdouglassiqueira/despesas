import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateControleDespesasDto } from '../domain/dto/create-controle-despesas.dto';
import { UpdateControleDespesasDto } from '../domain/dto/update-controle-despesas.dto';
import { ControleDespesasService } from '../services/controle-despesas.service';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';

@ApiTags('Controle Despesas')
@PermissionsGroup('Controle Despesas')
@Controller('controle-despesas')
export class ControleDespesasController {
  constructor(
    private readonly controleDespesasService: ControleDespesasService,
  ) { }

  @Post()
  @Permissions('criar_controle_despesas')
  async create(
    @Body() createControleDespesasRequest: CreateControleDespesasDto,
  ) {
    return await this.controleDespesasService.create(
      createControleDespesasRequest,
    );
  }

  @Get('relatorio')
  @Permissions('listar_controle_despesas')
  async getReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.controleDespesasService.getReport(startDate, endDate);
  }

  @Get()
  @Permissions('listar_controle_despesas')
  async findAll() {
    return await this.controleDespesasService.findAll();
  }

  @Get(':id')
  @Permissions('listar_controle_despesas_por_id')
  async findOne(@Param('id') id: string) {
    return await this.controleDespesasService.findOne(+id);
  }

  @Put(':id')
  @Permissions('atualizar_controle_despesas')
  async update(
    @Param('id') id: string,
    @Body() updateControleDespesasRequest: UpdateControleDespesasDto,
  ) {
    return await this.controleDespesasService.update(
      +id,
      updateControleDespesasRequest,
    );
  }

  @Delete(':id')
  @Permissions('deletar_controle_despesas')
  async delete(@Param('id') id: string) {
    return await this.controleDespesasService.delete(+id);
  }
}
