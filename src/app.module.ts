import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DatabaseModule } from './infra/db/database.module';
import { LoggerModule } from './infra/modules/logger/logger.module';

import { env } from './config/env';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MeModule } from './modules/me/me.module';

import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './infra/modules/auth/guard/auth.guard';
import { JwtModule } from '@nestjs/jwt';

import { LoggingInterceptor } from './infra/interceptors/logging/logging.interceptor';
import { CheckTokenModule } from './modules/check-token/check-token.module';
import { RolesModule } from './modules/roles/roles.module';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AdminSeederModule } from './modules/admin-seeder/admin-seeder.module';
import { LogsModule } from './modules/logs/logs.module';
import { ApiLoggingMiddleware } from './infra/middlewares/logging/api-logging.middleware';
import { HttpExceptionLoggingFilter } from './infra/filters/http-exception.filter';
import { ImportacaoModule } from './modules/importacao/importacao.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
// import { DespesasModule } from './modules/despesas/despesas.module';
// import { CategoriasModule } from './modules/categorias/categorias.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ControleDespesasModule } from './modules/controle-despesas/controle-despesas.module';
import { CategoriasModule } from './modules/categorias/categorias.module';
import { ContatosModule } from './modules/contatos/contatos.module';
import { DiscordModule } from './modules/discord/discord.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [env],
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret');
        if (!secret || secret.length < 32) {
          throw new Error('JWT_SECRET deve possuir pelo menos 32 caracteres');
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get('jwt.expiresIn') ?? '1h',
          },
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'infra', 'modules', 'uploader', 'files'),
      serveRoot: '/files',
    }),
    LoggerModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    MeModule,
    CheckTokenModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    AdminSeederModule,
    LogsModule,
    ImportacaoModule,
    TransactionsModule,
    CategoriesModule,
    AccountsModule,
    ControleDespesasModule,
    CategoriasModule,
    ContatosModule,
    DiscordModule,
    // DespesasModule,
    // CategoriasModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionLoggingFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiLoggingMiddleware).forRoutes('*');
  }
}
