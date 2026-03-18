import { ApiProperty } from '@nestjs/swagger';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Transaction } from '../../transactions/domain/transaction.entity';
// import { Budget } from '../../budgets/domain/budget.entity'; // Will create later

@Entity({ name: 'categories' })
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'Alimentação', description: 'Nome da categoria' })
    @Column({ length: 100 })
    name: string;

    @ApiProperty({ example: '#ff0000', description: 'Hex color code' })
    @Column({ length: 20, nullable: true })
    color: string;

    @ApiProperty({ example: 'fastfood', description: 'Material Icon name' })
    @Column({ length: 50, nullable: true })
    icon: string;

    @ApiProperty({ example: 'expense', description: 'income ou expense' })
    @Column({ length: 20 })
    type: string;

    @ApiProperty({ example: 1, description: 'ID da categoria pai' })
    @Column({ name: 'parent_id', nullable: true })
    parentId: number;

    @ManyToOne(() => Category, (category) => category.children)
    @JoinColumn({ name: 'parent_id' })
    parent: Category;

    @OneToMany(() => Category, (category) => category.parent)
    children: Category[];

    @OneToMany(() => Transaction, (transaction) => transaction.category)
    transactions: Transaction[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    constructor(partial?: Partial<Category>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
