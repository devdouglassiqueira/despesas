import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from './domain/users.entity';
import { UserController } from './presentation/users.controller';
import { UserService } from './services/users.service';
import { DatabaseModule } from '../../infra/db/database.module';
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter/bcrypt-adapter';
import { Repository } from 'typeorm';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Users])],
  controllers: [UserController],
  providers: [
    { provide: 'Hasher', useClass: BcryptAdapter },
    UserService,
    Repository,
  ],
  exports: [TypeOrmModule, UserService],
})
export class UsersModule {}
