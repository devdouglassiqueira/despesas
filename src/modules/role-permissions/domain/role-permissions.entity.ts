import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';

import { Roles } from 'src/modules/roles/domain/roles.entity';
import { Permissions } from 'src/modules/permissions/domain/permissions.entity';

@Entity({ name: 'role_permissions' })
@Unique(['roleId', 'permissionsId'])
export class RolePermissions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'permission_id' })
  permissionsId: number;

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

  @JoinColumn({ name: 'role_id' })
  @ManyToOne(() => Roles, (role: Roles) => role.id)
  role: Roles;

  @JoinColumn({ name: 'permission_id' })
  @ManyToOne(() => Permissions, (permission: Permissions) => permission.id)
  permissions: Permissions;
}
