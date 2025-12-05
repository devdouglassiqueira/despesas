import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ControleDespesas } from './domain/controle-despesas.entity';
import { ControleDespesasController } from './presentation/controle-despesas.controller';
import { ControleDespesasService } from './services/controle-despesas.service';
import { DatabaseModule } from '../../infra/db/database.module';
import { Repository } from 'typeorm';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([ControleDespesas])],
  controllers: [ControleDespesasController],
  providers: [ControleDespesasService, Repository],
  exports: [TypeOrmModule, ControleDespesasService],
})
export class ControleDespesasModule {}
