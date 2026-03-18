import { ApiProperty } from '@nestjs/swagger';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity({ name: 'attachments' })
export class Attachment {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 1 })
    @Column({ name: 'transaction_id' })
    transactionId: number;

    @ManyToOne(() => Transaction, (transaction) => transaction.attachments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'transaction_id' })
    transaction: Transaction;

    @ApiProperty({ example: 'https://storage.googleapis.com/...' })
    @Column({ length: 500 })
    url: string;

    @ApiProperty({ example: { size: 1024, type: 'image/png' } })
    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
