import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateDadosDiscordDto } from '../domain/dto/create-dados-discord.dto';
import { UpdateDadosDiscordDto } from '../domain/dto/update-dados-discord.dto';
import { DadosDiscordService } from '../services/dados-discord.service';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LogsService } from 'src/modules/logs/services/logs.service';

export const User = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
@ApiTags('Dados Discord')
@PermissionsGroup('Dados Discord')
@Controller('dados-discord')
export class DadosDiscordController {
  constructor(
    private readonly dadosDiscordService: DadosDiscordService,
    private readonly logsService: LogsService,
  ) {}

  @Post()
  @Permissions('criar_dados_discord')
  async create(@Body() dto: CreateDadosDiscordDto, @Req() req: any) {
    return await this.dadosDiscordService.create(dto, Number(req.user?.id));
  }

  @Get()
  @Permissions('listar_dados_discord')
  async findAll() {
    return await this.dadosDiscordService.findAll();
  }

  @Get(':id')
  @Permissions('listar_dados_discord_por_id')
  async findOne(@Param('id') id: string) {
    return await this.dadosDiscordService.findOne(+id);
  }

  @Put(':id')
  @Permissions('atualizar_dados_discord')
  async update(
    @Param('id') id: string,
    @Body() updateDadosDiscordRequest: UpdateDadosDiscordDto,
    @Req() req: any,
  ) {
    const dados = await this.dadosDiscordService.update(
      +id,
      updateDadosDiscordRequest,
      Number(req.user?.id),
    );

    return {
      id: dados.id,
      operador: dados.operador,
      email: dados.email,
      telefone: dados.telefone,
    };
  }

  @Delete(':id')
  @Permissions('deletar_dados_discord')
  async delete(@Param('id') id: string) {
    return await this.dadosDiscordService.delete(+id);
  }

  @Get(':id/logs')
  @Permissions('listar_logs_dados_discord')
  async getLogs(@Param('id') id: string) {
    return await this.logsService.list({
      type: 'audit',
      entity: 'DadosDiscord',
      entityId: id.toString(),
    });
  }
}
