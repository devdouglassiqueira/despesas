import { type LoggerService } from '@nestjs/common';

export abstract class Logger implements LoggerService {
  abstract log(message: any, ...optionalParams: any[]): any;
  abstract error(message: any, ...optionalParams: any[]): any;
  abstract warn(message: any, ...optionalParams: any[]): any;
  abstract debug(message: any, ...optionalParams: any[]): any;
}
