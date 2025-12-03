import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('checkToken')
@Controller('check-token')
export class ChecklistController {
  @Get()
  async checkToken() {
    return { message: 'Rota de verificação acessada com sucesso!' };
  }
}
