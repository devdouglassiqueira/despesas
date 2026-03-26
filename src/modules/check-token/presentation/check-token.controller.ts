import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/interfaces/decorators/public.decorator';

@ApiTags('checkToken')
@Public()
@Controller('check-token')
export class ChecklistController {
  @Get()
  async checkToken() {
    return { message: 'Rota de verificação acessada com sucesso!' };
  }
}
