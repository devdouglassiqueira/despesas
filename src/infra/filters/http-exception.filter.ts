import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogsService } from 'src/modules/logs/services/logs.service';

@Catch(HttpException)
export class HttpExceptionLoggingFilter implements ExceptionFilter {
  constructor(private readonly logsService: LogsService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const method = request.method;
    const url = (request as any).originalUrl || request.url;
    const ip = (request.headers['x-forwarded-for'] as string) || request.ip;
    const userAgent = (request.headers['user-agent'] as string) || undefined;
    const requestId =
      (request.headers['x-request-id'] as string) ||
      (response.getHeader?.('x-request-id') as string) ||
      undefined;

    // Para 401/403, registramos explicitamente e sinalizamos para evitar duplicidade
    if (status === 401 || status === 403) {
      try {
        (request as any)._alreadyLogged = true;
        (request as any)._error = {
          name: exception?.name,
          message: (exception as any)?.message,
          stack: (exception as any)?.stack,
        };
      } catch {}

      try {
        await this.logsService.createApiLog({
          level: 'warn',
          method,
          url,
          statusCode: status,
          durationMs: undefined,
          userId: (request as any)?.user?.id ?? null,
          requestId,
          controller: (request as any)?._controller,
          handler: (request as any)?._handler,
          ip,
          userAgent,
          params: (request as any).params,
          query: (request as any).query,
          body: (request as any).body,
          errorName: exception?.name,
          errorMessage:
            (exception.getResponse?.() as any)?.message ??
            (exception as any)?.message,
          stack: (exception as any)?.stack,
          message: `HTTP ${method} ${url} -> ${status}`,
        });
      } catch {
        // Nunca falhar a resposta por erro de log
      }
    }

    const resBody = (exception.getResponse && exception.getResponse()) || {
      statusCode: status,
      message: (exception as any)?.message || 'Error',
    };

    response.status(status).json(resBody as any);
  }
}
