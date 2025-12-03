import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'api_logs' })
export class ApiLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'info' })
  @Column({ nullable: true })
  level?: string;

  @ApiProperty({ example: 'GET' })
  @Column({ nullable: true })
  method?: string;

  @ApiProperty({ example: '/users' })
  @Column({ type: 'text', nullable: true })
  url?: string;

  @ApiProperty({ example: 200 })
  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode?: number;

  @ApiProperty({ example: 123 })
  @Column({ name: 'duration_ms', type: 'int', nullable: true })
  durationMs?: number;

  @ApiProperty({ example: 42 })
  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId?: number | null;

  @ApiProperty({ example: 'b9a0a2ad-2d52-4f8a-8520-6a0f2e1ba6f4' })
  @Column({ name: 'request_id', type: 'varchar', length: 64, nullable: true })
  requestId?: string;

  @ApiProperty({ example: 'UsersController' })
  @Column({ nullable: true })
  controller?: string;

  @ApiProperty({ example: 'findAll' })
  @Column({ nullable: true })
  handler?: string;

  @ApiProperty({ example: '127.0.0.1' })
  @Column({ nullable: true })
  ip?: string;

  @ApiProperty({ example: 'Mozilla/5.0 ...' })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @ApiProperty({ type: 'object', example: { id: '1' } })
  @Column({ type: 'jsonb', nullable: true })
  params?: any;

  @ApiProperty({ type: 'object', example: { page: 1 } })
  @Column({ type: 'jsonb', nullable: true })
  query?: any;

  @ApiProperty({ type: 'object', example: { name: 'John' } })
  @Column({ type: 'jsonb', nullable: true })
  body?: any;

  @ApiProperty({ example: 'ValidationError' })
  @Column({ name: 'error_name', nullable: true })
  errorName?: string;

  @ApiProperty({ example: 'Invalid payload' })
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @ApiProperty({ example: 'stacktrace...' })
  @Column({ type: 'text', nullable: true })
  stack?: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  message?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  constructor(props: Partial<ApiLog>) {
    Object.assign(this, props);
  }
}
