import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permissions } from '../domain/permissions.entity';
import { CreatePermissionDto } from '../domain/dto/create-permission.dto';
import { UpdatePermissionDto } from '../domain/dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const { name, group } = createPermissionDto;

    const existingPermission = await this.permissionsRepository.findOne({
      where: { name },
    });

    if (existingPermission) {
      throw new HttpException(`A permissão ${name} já existe.`, 400);
    }

    const permission = this.permissionsRepository.create({ name, group });
    return await this.permissionsRepository.save(permission);
  }

  async findAll() {
    return await this.permissionsRepository.find();
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionsRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new HttpException(`Permissão não encontrada.`, 404);
    }

    Object.assign(permission, updatePermissionDto);
    return await this.permissionsRepository.save(permission);
  }

  async delete(id: number) {
    const permission = await this.permissionsRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new HttpException(`Permissão não encontrada.`, 404);
    }

    await this.permissionsRepository.remove(permission);
    return { message: `Permissão foi removida com sucesso.` };
  }
}
