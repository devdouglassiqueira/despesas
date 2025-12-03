import { ApiProperty } from '@nestjs/swagger';
import { Roles } from 'src/modules/roles/domain/roles.entity';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Jonh Doe',
    description: 'Nome do usuário',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'jonh_doe',
    description: 'Nickname do usuário',
  })
  @Column()
  username: string;

  @ApiProperty({
    example: 'jonh_doe@mail.com',
    description: 'Email do usuário',
  })
  @Column()
  email: string;

  @ApiProperty({
    example: '12345678',
    description: 'Senha do usuário',
  })
  @Column()
  password: string;

  @ApiProperty({
    example: '23/09/1999',
    description: 'Data de nascimento do usuário',
  })
  @Column()
  birthday: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Status do usuário',
  })
  @Column()
  status: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Status do usuário',
  })
  @Column({
    name: 'avatar_url',
  })
  avatarUrl: string;

  @ApiProperty({
    example: '1',
    description: 'Role Id',
  })
  @Column({
    name: 'role_id',
  })
  roleId: number;

  @ManyToOne(() => Roles)
  @JoinColumn({ name: 'role_id' })
  role: Roles;

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

  constructor(users: Partial<Users>) {
    Object.assign(this, users);
  }
}
