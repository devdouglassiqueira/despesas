import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './presentation/transactions.controller';
import { Transaction } from './domain/transaction.entity';
import { Attachment } from './domain/attachment.entity';
import { Account } from '../accounts/domain/account.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction, Attachment, Account])],
    controllers: [TransactionsController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule { }
