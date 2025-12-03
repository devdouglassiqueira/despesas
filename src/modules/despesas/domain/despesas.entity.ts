import { ApiProperty } from '@nestjs/swagger';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'despesas' })
export class Despesas {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '10.00',
    description: 'Valor da compra',
  })
  @Column()
  valor: string;

  @ApiProperty({
    example: 'Mercado',
    description: 'Descrição da compra',
  })
  @Column()
  descricao: string;

  @ApiProperty({
    example: 'Alimentação',
    description: 'Tipo da compra',
  })
  @Column()
  tipo: string;

  @ApiProperty({
    example: 'Cartão Nubank',
    description: 'Cartão de Crédito',
  })
  @Column({
    name: 'forma_pagamento',
  })
  formaPagamento: string;

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

  @UpdateDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    default: null,
  })
  deletedAt: Date;

  constructor(despesas: Partial<Despesas>) {
    Object.assign(this, despesas);
  }
}
