import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'permissions' })
export class Permissions {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'criar_atendimentos',
    description: 'Nome da Permissão',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'atendimentos',
    description: 'Grupo da Permissão',
  })
  @Column({ nullable: true })
  group: string;

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

  constructor(permissions: Partial<Permissions>) {
    Object.assign(this, permissions);
  }
}
