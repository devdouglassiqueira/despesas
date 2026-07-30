import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from 'src/infra/modules/auth/guard/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../domain/dto/auth.dto';
import { Public } from 'src/common/interfaces/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async auth(@Body() authDto: AuthDto, @Req() req: Request) {
    return await this.authService.auth(authDto, req);
  }

  @Post('protected')
  @UseGuards(AuthGuard)
  async protectedRoute() {
    return 'Token válido!';
  }
}
