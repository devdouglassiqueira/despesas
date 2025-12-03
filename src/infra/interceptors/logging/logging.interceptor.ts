import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerService } from '../../modules/logger/services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const controllerName = context.getClass().name;
    const methodName = context.getHandler().name;

    // anexa nomes para o middleware capturar e persistir
    try {
      (request as any)._controller = controllerName;
      (request as any)._handler = methodName;
    } catch {}

    this.loggerService.track(
      controllerName,
      methodName,
      request?.user?.id || 'Usuário não autenticado',
    );

    return next.handle().pipe(
      tap(() => {
        // sucesso: nada a fazer, middleware persiste
      }),
      catchError((err) => {
        try {
          (request as any)._error = {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
          };
        } catch {}
        throw err;
      }),
    );
  }
}
