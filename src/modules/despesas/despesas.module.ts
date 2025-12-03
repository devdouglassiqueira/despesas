import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Despesas } from './domain/despesas.entity';
import { DespesasController } from './presentation/despesas.controller';
import { DespesasService } from './services/despesas.service';
import { DatabaseModule } from '../../infra/db/database.module';
import { Repository } from 'typeorm';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Despesas])],
  controllers: [DespesasController],
  providers: [DespesasService, Repository],
  exports: [TypeOrmModule, DespesasService],
})
export class DespesasModule {}
