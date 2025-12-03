import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiLog } from './domain/api-log.entity';
import { AuditLog } from './domain/audit-log.entity';
import { LogsService } from './services/logs.service';
import { LogsController } from './presentation/logs.controller';
import { Users } from '../users/domain/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiLog, AuditLog, Users])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
