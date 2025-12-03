import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LogsService } from '../services/logs.service';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';

@ApiTags('Logs')
@PermissionsGroup('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @Permissions('listar_logs')
  async list(@Query() query: any) {
    return await this.logsService.list(query);
  }
}
