import { ApiProperty } from '@nestjs/swagger';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Transaction } from '../../transactions/domain/transaction.entity';

@Entity({ name: 'accounts' })
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'Carteira Principal', description: 'Nome da conta' })
    @Column({ length: 100 })
    name: string;

    @ApiProperty({ example: 'wallet', description: 'Tipo da conta (wallet, bank, credit_card)' })
    @Column({ length: 50 })
    type: string;

    @ApiProperty({ example: 1000.00, description: 'Saldo inicial' })
    @Column({ name: 'initial_balance', type: 'decimal', precision: 10, scale: 2, default: 0 })
    initialBalance: number;

    @ApiProperty({ example: '#3f51b5', description: 'Cor da conta' })
    @Column({ length: 20, nullable: true })
    color: string;

    @OneToMany(() => Transaction, (transaction) => transaction.account)
    transactions: Transaction[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    constructor(partial?: Partial<Account>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
