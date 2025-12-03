import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogsService } from 'src/modules/logs/services/logs.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ApiLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logsService: LogsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const requestId =
      (req.headers['x-request-id'] as string) || randomUUID().toString();
    res.setHeader('x-request-id', requestId);

    // save parts we need even if body/params change later
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip;
    const userAgent = (req.headers['user-agent'] as string) || undefined;

    // When response finishes, persist the log
    res.on('finish', async () => {
      try {
        // Se já foi logado por um filtro (ex.: 401/403), evitar duplicidade
        if ((req as any)?._alreadyLogged) return;

        const durationMs = Date.now() - start;
        const statusCode = res.statusCode;
        const userId = (req as any)?.user?.id ?? null;
        const controller = (req as any)?._controller;
        const handler = (req as any)?._handler;

        const errInfo = (req as any)._error;
        await this.logsService.createApiLog({
          level:
            statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
          method,
          url,
          statusCode,
          durationMs,
          userId,
          requestId,
          controller,
          handler,
          ip,
          userAgent,
          params: (req as any).params,
          query: (req as any).query,
          body: (req as any).body,
          errorName: errInfo?.name,
          errorMessage: errInfo?.message,
          stack: errInfo?.stack,
          message:
            statusCode >= 400
              ? errInfo?.message || `HTTP ${method} ${url} -> ${statusCode}`
              : undefined,
        });
      } catch (e) {
        // avoid crashing on logging failure
      }
    });

    next();
  }
}
