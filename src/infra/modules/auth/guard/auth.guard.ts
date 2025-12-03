import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../../../../common/interfaces/decorators/public.decorator';
import { UserService } from 'src/modules/users/services/users.service';
import { LogsService } from 'src/modules/logs/services/logs.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly logsService: LogsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    try {
      const requiredPermissions = this.reflector.get<string[]>(
        'permissions',
        context.getHandler(),
      );

      const request = context.switchToHttp().getRequest();

      const authHeader: string = request.headers.authorization;

      if (!authHeader) {
        return false;
      }

      const [, accessToken] = authHeader.split(' ');

      if (!accessToken || accessToken === 'undefined' || accessToken === null) {
        return false;
      }

      const decoded = await this.jwtService.verifyAsync(accessToken);

      if (!decoded) {
        return false;
      }

      // Token deve ser enxuto e conter pelo menos o sub (userId)
      const { sub } = decoded as any;

      if (!sub) {
        throw new ForbiddenException('Access denied');
      }

      // Buscar usuário com permissões atuais no banco para autorização dinâmica
      const dbUser = await this.userService.findWithPermissionsById(sub);
      if (!dbUser || !dbUser.role || !dbUser.role.permissions) {
        throw new ForbiddenException('Access denied');
      }

      // Bloquear usuário inativo com log de auditoria
      const isInactive =
        typeof dbUser.status === 'string' &&
        dbUser.status.toLowerCase() === 'inactive';
      if (isInactive) {
        try {
          const request = context.switchToHttp().getRequest();
          const ip =
            (request.headers['x-forwarded-for'] as string) || request.ip;
          const requestId = request.headers['x-request-id'] as string;
          await this.logsService.createAuditLog({
            level: 'warn',
            action: 'access_denied',
            entity: 'users',
            entityId: String(dbUser.id),
            source: 'auth.guard',
            userId: dbUser.id,
            ip,
            requestId,
            message: 'Acesso bloqueado: usuário inativo',
            context: {
              reason: 'inactive_user',
              url: request?.originalUrl || request?.url,
              method: request?.method,
            },
          });
        } catch {}
        throw new ForbiddenException('User is inactive');
      }

      // Anexar um objeto de usuário simplificado à request
      request.user = {
        id: dbUser.id,
        email: dbUser.email,
        roleId: dbUser.role.id,
      };

      if (!requiredPermissions) {
        return true;
      }

      const userPermissions = dbUser.role.permissions.map((p) => p.name);

      const hasPermission = requiredPermissions.some((perm) => {
        const possui = userPermissions.includes(perm);

        return possui;
      });

      if (!hasPermission) {
        throw new ForbiddenException('Access denied!');
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
