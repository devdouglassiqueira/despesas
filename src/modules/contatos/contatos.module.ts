import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contato } from './domain/contato.entity';
import { ContatosService } from './services/contatos.service';
import { ContatosController } from './presentation/contatos.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Contato])],
    controllers: [ContatosController],
    providers: [ContatosService],
})
export class ContatosModule { }
