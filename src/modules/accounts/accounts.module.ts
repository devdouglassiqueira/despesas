import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './services/accounts.service';
import { AccountsController } from './presentation/accounts.controller';
import { Account } from './domain/account.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Account])],
    controllers: [AccountsController],
    providers: [AccountsService],
    exports: [AccountsService],
})
export class AccountsModule { }
