import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { RolePermissions } from '../domain/role-permissions.entity';
import { CreateRolePermissionsDto } from '../domain/dto/create-role-permissions.dto';
import { UpdateRolePermissionsDto } from '../domain/dto/update-role-permissions.dto';
import { Roles } from 'src/modules/roles/domain/roles.entity';
import { Permissions } from 'src/modules/permissions/domain/permissions.entity';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermissions)
    private readonly rolePermissionsRepository: Repository<RolePermissions>,

    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,

    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
  ) {}

  async create(createRolePermissionsDto: CreateRolePermissionsDto) {
    const { roleId, permissionsId } = createRolePermissionsDto;

    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new HttpException(
        `O role com ID ${roleId} não foi encontrado.`,
        404,
      );
    }

    const permission = await this.permissionsRepository.findOne({
      where: { id: permissionsId },
    });
    if (!permission) {
      throw new HttpException(
        `A permissão com ID ${permissionsId} não foi encontrada.`,
        404,
      );
    }

    try {
      const rolePermission = this.rolePermissionsRepository.create({
        roleId,
        permissionsId,
      });
      return await this.rolePermissionsRepository.save(rolePermission);
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpException(
          `Essa associação entre role e permissão já existe.`,
          400,
        );
      }
      throw new HttpException(
        `Erro ao criar associação: ${error.message}`,
        500,
      );
    }
  }

  async assignPermissionsToRole(
    roleId: number,
    permissionsIds: number[],
  ): Promise<RolePermissions[]> {
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new HttpException(
        `O role com ID ${roleId} não foi encontrado.`,
        404,
      );
    }

    const associationsToCreate: RolePermissions[] = [];

    for (const permissionId of permissionsIds) {
      const permission = await this.permissionsRepository.findOne({
        where: { id: permissionId },
      });
      if (!permission) {
        throw new HttpException(
          `A permissão com ID ${permissionId} não foi encontrada.`,
          404,
        );
      }

      const existingAssociation = await this.rolePermissionsRepository.findOne({
        where: { roleId, permissionsId: permissionId },
      });
      if (existingAssociation) {
        continue;
      }

      const newAssociation = this.rolePermissionsRepository.create({
        roleId,
        permissionsId: permissionId,
      });
      associationsToCreate.push(newAssociation);
    }

    try {
      const savedAssociations =
        await this.rolePermissionsRepository.save(associationsToCreate);
      return savedAssociations;
    } catch (error) {
      throw new HttpException(
        `Erro ao atribuir permissões: ${error.message}`,
        500,
      );
    }
  }

  async findAll() {
    return await this.rolePermissionsRepository.find({
      relations: ['role', 'permissions'],
    });
  }

  async update(id: number, updateRolePermissionsDto: UpdateRolePermissionsDto) {
    const rolePermission = await this.rolePermissionsRepository.findOne({
      where: { id },
    });

    if (!rolePermission) {
      throw new HttpException(`Associação com ID ${id} não encontrada.`, 404);
    }

    Object.assign(rolePermission, updateRolePermissionsDto);
    return await this.rolePermissionsRepository.save(rolePermission);
  }

  async updatePermissionsForRole(
    roleId: number,
    newPermissionsIds: number[],
  ): Promise<RolePermissions[]> {
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new HttpException(
        `O role com ID ${roleId} não foi encontrado.`,
        404,
      );
    }

    const currentAssociations = await this.rolePermissionsRepository.find({
      where: { roleId },
    });
    const currentPermissionsIds = currentAssociations.map(
      (rp) => rp.permissionsId,
    );

    const associationsToRemove = currentAssociations.filter(
      (rp) => !newPermissionsIds.includes(rp.permissionsId),
    );

    const permissionsToAdd = newPermissionsIds.filter(
      (pid) => !currentPermissionsIds.includes(pid),
    );

    if (associationsToRemove.length > 0) {
      await this.rolePermissionsRepository.remove(associationsToRemove);
    }

    const associationsToCreate: RolePermissions[] = [];
    for (const permissionId of permissionsToAdd) {
      const permission = await this.permissionsRepository.findOne({
        where: { id: permissionId },
      });
      if (!permission) {
        throw new HttpException(
          `A permissão com ID ${permissionId} não foi encontrada.`,
          404,
        );
      }
      const newAssociation = this.rolePermissionsRepository.create({
        roleId,
        permissionsId: permissionId,
      });
      associationsToCreate.push(newAssociation);
    }

    if (associationsToCreate.length > 0) {
      await this.rolePermissionsRepository.save(associationsToCreate);
    }

    return await this.rolePermissionsRepository.find({
      where: { roleId },
      relations: ['role', 'permissions'],
    });
  }

  async delete(id: number) {
    const rolePermission = await this.rolePermissionsRepository.findOne({
      where: { id },
    });

    if (!rolePermission) {
      throw new HttpException(`Associação com ID ${id} não encontrada.`, 404);
    }

    await this.rolePermissionsRepository.remove(rolePermission);
    return { message: `A associação foi removida com sucesso.` };
  }

  async deleteMany(roleId: number, permissionIds: number[]) {
    if (!permissionIds || permissionIds.length === 0) {
      throw new HttpException('Nenhum ID foi fornecido para remoção.', 400);
    }

    const rolePermissions = await this.rolePermissionsRepository.find({
      where: { roleId, permissionsId: In(permissionIds) },
    });

    if (rolePermissions.length !== permissionIds.length) {
      throw new HttpException(
        'Uma ou mais associações não foram encontradas.',
        404,
      );
    }

    await this.rolePermissionsRepository.remove(rolePermissions);
    return { message: 'Associações removidas com sucesso.' };
  }
}
