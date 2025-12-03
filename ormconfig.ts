import { DataSource } from 'typeorm';
import { join } from 'path';
require('dotenv/config');

export const connectionSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? '', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  entities: [
    join(__dirname, 'src', 'modules', '**', 'domain', '*.entity{.ts,.js}'),
  ],
  migrations: [
    join(__dirname, 'src', 'infra', 'db', 'migrations', '*{.ts,.js}'),
  ],
  migrationsTableName: 'migrations',
});
