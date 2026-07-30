import { BadRequestException, Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from '../domain/dto/create-transaction.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    create(@Body() createTransactionDto: CreateTransactionDto, @Req() request: Request) {
        return this.transactionsService.create(createTransactionDto, (request as any).user.id);
    }

    @Post('import')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 5 * 1024 * 1024, files: 1 },
        fileFilter: (_request, file, callback) => {
            const allowed = /\.(csv|ofx)$/i.test(file.originalname);
            callback(
                allowed ? null : new BadRequestException('Envie apenas arquivos CSV ou OFX'),
                allowed,
            );
        },
    }))
    importFile(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() request: Request) {
        return this.transactionsService.importTransactions(file, body.accountId, (request as any).user.id);
    }

    @Get()
    findAll(@Query() query: any, @Req() request: Request) {
        return this.transactionsService.findAll(query, (request as any).user.id);
    }

    @Get('tags')
    findTags(@Req() request: Request) {
        return this.transactionsService.findUniqueTags((request as any).user.id);
    }

    @Get('dashboard')
    getDashboard(
        @Req() request: Request,
        @Query('month') month?: number,
        @Query('year') year?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.transactionsService.getDashboardSummary(month, year, startDate, endDate, (request as any).user.id);
    }

    @Get('summary/tags')
    getTagsSummary(
        @Req() request: Request,
        @Query('month') month?: number,
        @Query('year') year?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.transactionsService.getTagSummary(month, year, startDate, endDate, (request as any).user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() request: Request) {
        return this.transactionsService.findOne(+id, (request as any).user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto, @Req() request: Request) {
        return this.transactionsService.update(+id, updateTransactionDto, (request as any).user.id);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() request: Request) {
        return this.transactionsService.remove(+id, (request as any).user.id);
    }
}
