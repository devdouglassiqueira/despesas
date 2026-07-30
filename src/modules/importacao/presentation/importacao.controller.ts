
import {
    BadRequestException,
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportacaoService } from '../services/importacao.service';

@Controller('importacao')
export class ImportacaoController {
    constructor(private readonly importacaoService: ImportacaoService) { }

    @Get()
    test() {
        return { message: 'Importacao module is working' };
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 5 * 1024 * 1024, files: 1 },
        fileFilter: (_request, file, callback) => {
            const allowedExtension = /\.(csv|ofx)$/i.test(file.originalname);
            const allowedMimeType = [
                'text/csv',
                'application/csv',
                'text/plain',
                'application/octet-stream',
                'application/x-ofx',
            ].includes(file.mimetype);
            callback(
                allowedExtension && allowedMimeType
                    ? null
                    : new BadRequestException('Envie apenas arquivos CSV ou OFX'),
                allowedExtension && allowedMimeType,
            );
        },
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return this.importacaoService.parseFile(file);
    }
}
