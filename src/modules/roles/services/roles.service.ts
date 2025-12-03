import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Roles } from '../domain/roles.entity';
import { CreateRoleDto } from '../domain/dto/create-role.dto';
import { UpdateRoleDto } from '../domain/dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name, description } = createRoleDto;

    const existingRole = await this.rolesRepository.findOne({
      where: { name },
    });

    if (existingRole) {
      throw new HttpException(`O role ${name} já existe.`, 400);
    }

    const role = this.rolesRepository.create({ name, description });
    return await this.rolesRepository.save(role);
  }

  async findAll() {
    return await this.rolesRepository.find({ relations: ['permissions'] });
  }

  async findOne(id: number) {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new HttpException(`Role não encontrado.`, 404);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.rolesRepository.findOne({ where: { id } });

    if (!role) {
      throw new HttpException(`Role não encontrado.`, 404);
    }

    Object.assign(role, updateRoleDto);
    return await this.rolesRepository.save(role);
  }

  async delete(id: number) {
    const role = await this.rolesRepository.findOne({ where: { id } });

    if (!role) {
      throw new HttpException(`Role não encontrado.`, 404);
    }

    await this.rolesRepository.remove(role);
    return { message: `Role removido com sucesso.` };
  }
}
