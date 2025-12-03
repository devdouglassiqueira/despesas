import { Injectable, HttpException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';

import { Users } from '../../users/domain/users.entity';

@Injectable()
export class MeService {
  constructor(
    @Inject(REQUEST)
    private request,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async findOne() {
    const { id } = this.request.user;
    const user = await this.userRepository.findOne({
      select: [
        'id',
        'name',
        'email',
        'username',
        'birthday',
        'status',
        'avatarUrl',
      ],
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new HttpException('User not found', 400);
    }

    return user;
  }
}
