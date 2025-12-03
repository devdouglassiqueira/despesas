import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MeService } from '../services/me.service';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';

@ApiTags('Me')
@PermissionsGroup('Me')
@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @Permissions('get_me')
  async findOne() {
    return await this.meService.findOne();
  }
}
