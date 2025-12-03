import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesService } from './services/roles.service';
import { RolesController } from './presentation/roles.controller';
import { Roles } from './domain/roles.entity';

import { DatabaseModule } from '../../infra/db/database.module';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Roles])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
