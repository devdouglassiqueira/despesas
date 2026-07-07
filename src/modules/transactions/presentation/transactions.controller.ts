import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from '../domain/dto/create-transaction.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/interfaces/decorators/public.decorator';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Public()
    @Post()
    create(@Body() createTransactionDto: CreateTransactionDto) {
        return this.transactionsService.create(createTransactionDto);
    }

    @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    importFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
        return this.transactionsService.importTransactions(file, body.accountId);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.transactionsService.findAll(query);
    }

    @Get('tags')
    findTags() {
        return this.transactionsService.findUniqueTags();
    }

    @Get('dashboard')
    getDashboard(
        @Query('month') month?: number,
        @Query('year') year?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.transactionsService.getDashboardSummary(month, year, startDate, endDate);
    }

    @Get('summary/tags')
    getTagsSummary(
        @Query('month') month?: number,
        @Query('year') year?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.transactionsService.getTagSummary(month, year, startDate, endDate);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transactionsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
        return this.transactionsService.update(+id, updateTransactionDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.transactionsService.remove(+id);
    }
}
