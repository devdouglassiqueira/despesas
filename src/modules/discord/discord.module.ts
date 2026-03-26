import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
    imports: [TransactionsModule],
    providers: [DiscordService],
    exports: [DiscordService],
})
export class DiscordModule {}
