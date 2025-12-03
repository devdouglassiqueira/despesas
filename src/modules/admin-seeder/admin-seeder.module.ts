import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule } from '../../infra/db/database.module';

import { Roles } from '../roles/domain/roles.entity';
import { Permissions } from '../permissions/domain/permissions.entity';
import { RolePermissions } from '../role-permissions/domain/role-permissions.entity';
import { Users } from '../users/domain/users.entity';

import { AdminSeederService } from './services/admin-seeder.service';
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter/bcrypt-adapter';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Roles, Permissions, RolePermissions, Users]),
  ],
  providers: [
    { provide: 'Hasher', useClass: BcryptAdapter },
    AdminSeederService,
  ],
})
export class AdminSeederModule {}
