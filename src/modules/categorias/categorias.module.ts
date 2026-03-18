import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './domain/categoria.entity';
import { CategoriasService } from './services/categorias.service';
import { CategoriasController } from './presentation/categorias.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Categoria])],
    controllers: [CategoriasController],
    providers: [CategoriasService],
})
export class CategoriasModule { }
