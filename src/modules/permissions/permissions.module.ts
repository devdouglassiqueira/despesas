import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryModule } from '@nestjs/core';

import { PermissionsService } from './services/permissions.service';
import { PermissionsController } from './presentation/permissions.controller';
import { Permissions } from './domain/permissions.entity';

import { PermissionExplorerService } from './services/permission-explorer.service';
import { DatabaseModule } from '../../infra/db/database.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Permissions]),
    DiscoveryModule,
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionExplorerService],
})
export class PermissionsModule {}
