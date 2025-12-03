import { Injectable } from '@nestjs/common';
import { type Logger } from '../ports/logger.port';
import { Winston } from '../winston.build';

@Injectable()
export class LoggerWinstonAdapter implements Logger {
  constructor(private readonly logger: Winston) {}

  log(message: any, ...optionalParams: any[]): any {
    this.logger.logger.info(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]): any {
    let options: any = {};
    options.context = optionalParams[1];
    if (typeof optionalParams[0] === 'string')
      options.stack = optionalParams[0];
    else options = { ...options, ...optionalParams };
    this.logger.logger.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): any {
    this.logger.logger.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]): any {
    this.logger.logger.debug(message, ...optionalParams);
  }
}
