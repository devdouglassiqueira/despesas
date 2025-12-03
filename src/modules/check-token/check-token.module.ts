import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChecklistController } from './presentation/check-token.controller';

@Module({
  imports: [TypeOrmModule.forFeature()],
  controllers: [ChecklistController],
  exports: [TypeOrmModule],
})
export class CheckTokenModule {}
