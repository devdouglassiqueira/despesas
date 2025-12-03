import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from '../users/domain/users.entity';
import { MeController } from './presentation/me.controller';
import { MeService } from './services/me.service';
import { UserService } from '../users/services/users.service';
import { AuthGuardModule } from '../../infra/modules/auth/auth.guard.module';

import { DatabaseModule } from '../../infra/db/database.module';
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter/bcrypt-adapter';

@Module({
  imports: [AuthGuardModule, DatabaseModule, TypeOrmModule.forFeature([Users])],
  controllers: [MeController],
  providers: [
    MeService,
    { provide: 'Hasher', useClass: BcryptAdapter },
    UserService,
  ],
})
export class MeModule {}
