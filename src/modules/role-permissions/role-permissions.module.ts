import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolePermissions } from './domain/role-permissions.entity';
import { Roles } from '../roles/domain/roles.entity';
import { Permissions } from '../permissions/domain/permissions.entity';

import { RolePermissionsService } from './services/role-permissions.service';
import { RolePermissionsController } from './presentation/role-permissions.controller';

import { DatabaseModule } from '../../infra/db/database.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([RolePermissions, Roles, Permissions]),
  ],
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService],
  exports: [RolePermissionsService],
})
export class RolePermissionsModule {}
