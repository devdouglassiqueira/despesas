
import { Controller, Post, UseInterceptors, UploadedFile, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportacaoService } from '../services/importacao.service';

@Controller('importacao')
export class ImportacaoController {
    constructor(private readonly importacaoService: ImportacaoService) {
        console.log('ImportacaoController initialized');
    }

    @Get()
    test() {
        return { message: 'Importacao module is working' };
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return this.importacaoService.parseFile(file);
    }
}
