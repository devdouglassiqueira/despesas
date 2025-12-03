import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from './guard/auth.guard';
import { UserService } from 'src/modules/users/services/users.service';
import { Users } from 'src/modules/users/domain/users.entity';
import { BcryptAdapter } from 'src/infra/criptography/bcrypt-adapter/bcrypt-adapter';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from 'src/infra/db/database.module';
import { JwtService } from '@nestjs/jwt';
import { LogsModule } from 'src/modules/logs/logs.module';

const providers = [
  AuthGuard,
  ConfigService,
  UserService,
  { provide: 'HashComparer', useClass: BcryptAdapter },
  { provide: 'Hasher', useClass: BcryptAdapter },
  JwtService,
];

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Users]),
    LogsModule,
  ],
  providers: [...providers],
  exports: [...providers],
})
export class AuthGuardModule {}
