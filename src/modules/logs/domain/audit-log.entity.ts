import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'info' })
  @Column({ nullable: true })
  level?: string;

  @ApiProperty({ example: 'create' })
  @Column({ nullable: true })
  action?: string;

  @ApiProperty({ example: 'users' })
  @Column({ nullable: true })
  entity?: string;

  @ApiProperty({ example: '123' })
  @Column({ name: 'entity_id', type: 'varchar', length: 64, nullable: true })
  entityId?: string;

  @ApiProperty({ example: 'users.module' })
  @Column({ nullable: true })
  source?: string;

  @ApiProperty({ example: '127.0.0.1' })
  @Column({ nullable: true })
  ip?: string;

  @ApiProperty({ example: 42 })
  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId?: number | null;

  @ApiProperty({ example: 'Usuário criado com sucesso' })
  @Column({ type: 'text', nullable: true })
  message?: string;

  @ApiProperty({ example: 'b9a0a2ad-2d52-4f8a-8520-6a0f2e1ba6f4' })
  @Column({ name: 'request_id', type: 'varchar', length: 64, nullable: true })
  requestId?: string;

  @ApiProperty({ type: 'object' })
  @Column({ type: 'jsonb', nullable: true })
  context?: any;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  constructor(props: Partial<AuditLog>) {
    Object.assign(this, props);
  }
}
