import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from '../domain/dto/create-transaction.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

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

    @Get('dashboard')
    getDashboard(@Query('month') month?: number, @Query('year') year?: number) {
        return this.transactionsService.getDashboardSummary(month, year);
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
