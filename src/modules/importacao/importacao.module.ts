
import { Module } from '@nestjs/common';
import { ImportacaoService } from './services/importacao.service';
import { ImportacaoController } from './presentation/importacao.controller';

@Module({
    controllers: [ImportacaoController],
    providers: [ImportacaoService],
})
export class ImportacaoModule { }
