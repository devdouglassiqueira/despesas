import { ApiProperty } from '@nestjs/swagger';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Category } from '../../categories/domain/category.entity';
import { Account } from '../../accounts/domain/account.entity';
import { Attachment } from './attachment.entity';
import { Users } from '../../users/domain/users.entity';

@Entity({ name: 'transactions' })
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id', nullable: true })
    userId: number;

    @ManyToOne(() => Users, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'user_id' })
    user: Users;

    @ApiProperty({ example: 'Compra no mercado', description: 'Descrição da transação' })
    @Column({ length: 255 })
    description: string;

    @ApiProperty({ example: 150.50, description: 'Valor da transação' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @ApiProperty({ example: 'expense', description: 'income ou expense' })
    @Column({ length: 20 })
    type: string;

    @ApiProperty({ example: '2024-01-01T10:00:00Z', description: 'Data da transação' })
    @Column({ type: 'timestamp' })
    date: Date;

    @ApiProperty({ example: 'paid', description: 'Status (paid, pending)' })
    @Column({ length: 20, default: 'paid' })
    status: string;

    @ApiProperty({ example: 1, description: 'ID da categoria' })
    @Column({ name: 'category_id', nullable: true })
    categoryId: number;

    @ManyToOne(() => Category, (category) => category.transactions)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @ApiProperty({ example: 1, description: 'ID da conta/carteira' })
    @Column({ name: 'account_id', nullable: true })
    accountId: number;

    @ManyToOne(() => Account, (account) => account.transactions)
    @JoinColumn({ name: 'account_id' })
    account: Account;

    @ApiProperty({ example: 'Credit Card', description: 'Forma de pagamento (legacy support mostly)' })
    @Column({ name: 'payment_method', length: 50, nullable: true })
    paymentMethod: string;

    @ApiProperty({ example: '2024-01-10T10:00:00Z', description: 'Data de vencimento' })
    @Column({ name: 'due_date', type: 'timestamp', nullable: true })
    dueDate: Date;

    @ApiProperty({ example: 'Notas adicionais', description: 'Observações' })
    @Column({ type: 'text', nullable: true })
    notes: string;

    @ApiProperty({ example: 'Nao é minha, especificar', description: 'Tags para busca e filtros' })
    @Column({ length: 255, nullable: true })
    tags: string;

    @OneToMany(() => Attachment, (attachment) => attachment.transaction)
    attachments: Attachment[];

    @ApiProperty({ example: 1, description: 'Número da parcela', required: false })
    @Column({ name: 'installment_number', type: 'int', nullable: true })
    installmentNumber: number;

    @ApiProperty({ example: 12, description: 'Total de parcelas', required: false })
    @Column({ name: 'installment_total', type: 'int', nullable: true })
    installmentTotal: number;

    @ApiProperty({ example: 1, description: 'ID da transação pai (para parcelamentos)', required: false })
    @Column({ name: 'parent_id', type: 'int', nullable: true })
    parentId: number;

    @ApiProperty({ example: false, description: 'Se a transação é recorrente', default: false })
    @Column({ name: 'is_recurring', type: 'boolean', default: false })
    isRecurring: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    constructor(partial?: Partial<Transaction>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
