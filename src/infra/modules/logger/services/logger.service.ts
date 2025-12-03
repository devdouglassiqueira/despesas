import {
  Inject,
  Injectable,
  type LogLevel,
  type LoggerService as LoggerServiceNest,
} from '@nestjs/common';
import { Logger } from '../ports/logger.port';

@Injectable()
export class LoggerService implements LoggerServiceNest {
  private readonly loggerService: LoggerServiceNest;
  constructor(@Inject(Logger) readonly logger: Logger) {
    this.loggerService = logger;
  }

  log(message: any, ...optionalParams: any[]) {
    this.loggerService.log(message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.loggerService.error(message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.loggerService.warn(message, optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.loggerService?.debug?.(message, optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.loggerService?.verbose?.(message, optionalParams);
  }

  setLogLevels?(levels: LogLevel[]) {
    this.loggerService?.verbose?.(levels);
  }

  track(constructorName: string, methodName: string, userId: string) {
    this.loggerService.log(
      `Called CLASS: ${constructorName}, METHOD: ${methodName}, USER_PROFILE: ${userId}`,
    );
  }
}
