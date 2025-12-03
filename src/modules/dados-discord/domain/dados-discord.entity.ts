import { ApiProperty } from '@nestjs/swagger';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'dados_discord' })
export class DadosDiscord {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Jonh.Doe',
    description: 'Nome do operador',
  })
  @Column()
  operador: string;

  @ApiProperty({
    example: 'jonh_doe@mail.com',
    description: 'Email do operador',
  })
  @Column()
  email: string;
  @ApiProperty({
    example: '(22)99999-9999',
    description: 'Telefone do operador',
  })
  @Column()
  telefone: string;

  @ApiProperty({
    example: '12345678',
    description: 'Senha do operador',
  })
  @Column()
  password: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Status do operador',
  })
  @Column()
  status: string;

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

  constructor(dadosDiscord: Partial<DadosDiscord>) {
    Object.assign(this, dadosDiscord);
  }
}
