import { HttpException, Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthDto } from '../domain/dto/auth.dto';
import { Request } from 'express';
import { LogsService } from 'src/modules/logs/services/logs.service';
import { UserService } from '../../users/services/users.service';
import { HashComparer } from 'src/common/interfaces/criptography/hash-comparer.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
    @Inject('HashComparer')
    private readonly hashComparer: HashComparer,
    private readonly logsService: LogsService,
  ) {}

  async auth(authDto: AuthDto, req?: Request) {
    const { email, password } = authDto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new HttpException('Email or password invalid', 403);
    }
    const isValid = await this.hashComparer.compare(password, user.password);
    if (!isValid) {
      throw new HttpException('Email or password invalid', 403);
    }

    // Bloquear login de usuário inativo com audit log
    const isInactive =
      typeof user.status === 'string' &&
      user.status.toLowerCase() === 'inactive';
    if (isInactive) {
      try {
        const ip = (req?.headers['x-forwarded-for'] as string) || req?.ip;
        const requestId = (req?.headers['x-request-id'] as string) || undefined;
        await this.logsService.createAuditLog({
          level: 'warn',
          action: 'login_denied',
          entity: 'users',
          entityId: String(user.id),
          source: 'auth.service',
          userId: user.id,
          ip,
          requestId,
          message: 'Login bloqueado: usuário inativo',
          context: {
            reason: 'inactive_user',
            email,
          },
        });
      } catch {}

      throw new HttpException('User is inactive', 403);
    }

    // Token enxuto: apenas identificadores necessários para autenticação.
    // Autorização de permissões ocorrerá no guard consultando o banco.
    const payload = {
      sub: user.id,
      rid: user.role.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    // Enviar ao frontend a visão das telas permitidas (grupos) e permissões
    const permissions = user.role.permissions.map((p) => p.name);
    const screensSet = new Set(
      user.role.permissions
        .map((p) => p.group)
        .filter((g) => typeof g === 'string' && g.length > 0),
    );
    const allowedScreens = Array.from(screensSet);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        status: user.status,
        avatarUrl: user.avatarUrl,
        role: {
          id: user.role.id,
          name: user.role.name,
        },
      },
      allowedScreens,
      permissions,
    };
  }

  async validateUser(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return this.authService.validateUser(payload);
  }
}
