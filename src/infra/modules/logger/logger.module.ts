import { Module } from '@nestjs/common';
import { LoggerWinstonAdapter } from './adapters/logger-winston.adapter';
import { Logger } from './ports/logger.port';
import { Winston } from './winston.build';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './services/logger.service';

@Module({
  providers: [
    ConfigService,
    Winston,
    {
      provide: Logger,
      useClass: LoggerWinstonAdapter,
    },
    LoggerService,
  ],
  exports: [Logger, LoggerService],
})
export class LoggerModule {}
