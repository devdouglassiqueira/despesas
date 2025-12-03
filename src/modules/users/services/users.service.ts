import { Injectable, Inject, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, IsNull } from 'typeorm';

import { CreateUserDto } from '../domain/dto/create-user.dto';
import { UpdateUserDto } from '../domain/dto/update-user.dto';
import { Users } from '../domain/users.entity';
import { Hasher } from '../../../common/interfaces/criptography/hasher.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly entityManager: EntityManager,
    @Inject('Hasher')
    private readonly hasher: Hasher,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, username, email, password, birthday, status, roleId } =
      createUserDto;

    const emailExist = await this.userRepository.findOne({
      where: { email },
    });

    const usernameExist = await this.userRepository.findOne({
      where: { username },
    });

    if (emailExist || usernameExist) {
      if (emailExist && usernameExist) {
        throw new HttpException('Username and Email already taken', 409);
      }

      if (emailExist) {
        throw new HttpException('Email already taken', 409);
      }

      if (usernameExist) {
        throw new HttpException('Username already taken', 409);
      }
    }

    if (!roleId) {
      throw new HttpException('Role ID is required', 400);
    }

    const hashedPassword = await this.hasher.hash(password);

    const user = new Users({
      name,
      username,
      email,
      password: hashedPassword,
      birthday,
      status,
      roleId,
    });

    return await this.entityManager.save(user);
  }

  async findAll() {
    const users = await this.userRepository.find({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        birthday: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        deletedAt: true,
      },
      relations: {
        role: true,
      },
      where: {
        deletedAt: IsNull(),
      },
      order: {
        status: 'ASC',
        name: 'ASC',
      },
    });

    if (!users.length) {
      throw new HttpException('No users found', 404);
    }

    return users.sort((a, b) => {
      if (a.status === b.status) {
        return a.name.localeCompare(b.name);
      }
      return a.status === 'inactive' ? 1 : -1;
    });
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        username: true,
        status: true,
        avatarUrl: true,
        createdAt: false,
        updatedAt: false,
        deletedAt: true,
      },
      where: { email },
      relations: {
        role: {
          permissions: true,
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }

  async findOne(id: number) {
    if (!id) {
      throw new HttpException('User ID is required', 400);
    }

    const user = await this.userRepository.findOne({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        birthday: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        deletedAt: true,
      },
      relations: {
        role: true,
      },
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return { user };
  }

  async findWithPermissionsById(id: number) {
    if (!id) {
      throw new HttpException('User ID is required', 400);
    }

    const user = await this.userRepository.findOne({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        status: true,
        avatarUrl: true,
        deletedAt: true,
      },
      where: { id, deletedAt: IsNull() },
      relations: {
        role: {
          permissions: true,
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }

  async update(id: number, updateUserRequest: UpdateUserDto) {
    if (!id) {
      throw new HttpException('User ID is required', 400);
    }

    const user = await this.entityManager.findOneBy(Users, { id });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (updateUserRequest.password) {
      updateUserRequest.password = await this.hasher.hash(
        updateUserRequest.password,
      );
    }

    Object.assign(user, updateUserRequest);

    return await this.entityManager.save(user);
  }

  async delete(id: number) {
    if (!id) {
      throw new HttpException('User ID is required', 400);
    }

    const user = await this.entityManager.findOneBy(Users, { id });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    Object.assign(user, { deletedAt: new Date() });

    return await this.entityManager.save(user);
  }
}
