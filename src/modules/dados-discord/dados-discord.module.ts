import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DadosDiscord } from './domain/dados-discord.entity';
import { DadosDiscordController } from './presentation/dados-discord.controller';
import { DadosDiscordService } from './services/dados-discord.service';
import { DatabaseModule } from '../../infra/db/database.module';
import { Repository } from 'typeorm';
import { LogsModule } from 'src/modules/logs/logs.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([DadosDiscord]),
    LogsModule,
  ],
  controllers: [DadosDiscordController],
  providers: [DadosDiscordService, Repository],
  exports: [TypeOrmModule, DadosDiscordService],
})
export class DadosDiscordModule {}
