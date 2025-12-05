import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'controle_despesas' })
export class ControleDespesas {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '100.00',
    description: 'Saldo da conta após a transação',
  })
  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0, // se não tiver nada, começa em 0
  })
  saldo: string;

  @ApiProperty({
    example: '10.00',
    description: 'Valor de entrada ou saída',
  })
  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  valor: string;

  @ApiProperty({
    example: 'Depósito',
    description: 'Descrição da transação',
  })
  @Column({ type: 'varchar', length: 255 })
  descricao: string;

  @ApiProperty({
    example: 'entrada',
    description: 'Tipo da transação (entrada ou saida)',
  })
  @Column({ type: 'varchar', length: 20 })
  tipo: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;

  constructor(partial?: Partial<ControleDespesas>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
