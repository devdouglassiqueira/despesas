import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from '../users/domain/users.entity';
import { AuthController } from './presentation/auth.controller';
import { AuthService, JwtStrategy } from './services/auth.service';
import { UserService } from '../users/services/users.service';

import { DatabaseModule } from '../../infra/db/database.module';
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter/bcrypt-adapter';
import { LogsModule } from '../logs/logs.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn') ?? '1h',
        },
      }),
    }),
    DatabaseModule,
    LogsModule,
    TypeOrmModule.forFeature([Users]),
  ],
  controllers: [AuthController],
  providers: [
    { provide: 'HashComparer', useClass: BcryptAdapter },
    { provide: 'Hasher', useClass: BcryptAdapter },
    AuthService,
    JwtStrategy,
    UserService,
  ],
})
export class AuthModule {}
