import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { type ConfigService } from '@nestjs/config';
import { join } from 'path';

export const postgresSetup = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return {
    type: 'postgres',
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.database'),
    synchronize: configService.get<boolean>('database.synchronize'),
    // Funciona em dev (src) e build (dist)
    entities: [
      join(
        __dirname,
        '..',
        '..',
        'modules',
        '**',
        'domain',
        '*.entity.{ts,js}',
      ),
    ],
    migrations: [
      join(__dirname, '..', '..', 'infra', 'db', 'migrations', '*.{ts,js}'),
    ],
    autoLoadEntities: true,
  };
};
