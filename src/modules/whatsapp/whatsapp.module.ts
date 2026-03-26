import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
    imports: [TransactionsModule],
    providers: [WhatsappService],
    exports: [WhatsappService],
})
export class WhatsappModule {}
