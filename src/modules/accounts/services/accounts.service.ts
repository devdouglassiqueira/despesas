import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../domain/account.entity';
import { CreateAccountDto, UpdateAccountDto } from '../domain/dto/create-account.dto';

@Injectable()
export class AccountsService {
    constructor(
        @InjectRepository(Account)
        private accountRepository: Repository<Account>,
    ) { }

    create(createAccountDto: CreateAccountDto, userId: number) {
        const account = this.accountRepository.create({ ...createAccountDto, userId });
        return this.accountRepository.save(account);
    }

    findAll(userId: number) {
        return this.accountRepository.find({ where: { userId }, order: { name: 'ASC' } });
    }

    async findOne(id: number, userId: number) {
        const account = await this.accountRepository.findOne({ where: { id, userId } });
        if (!account) {
            throw new NotFoundException(`Account with ID ${id} not found`);
        }
        return account;
    }

    async update(id: number, updateAccountDto: UpdateAccountDto, userId: number) {
        const account = await this.findOne(id, userId);
        this.accountRepository.merge(account, updateAccountDto);
        return this.accountRepository.save(account);
    }

    async remove(id: number, userId: number) {
        const account = await this.findOne(id, userId);
        return this.accountRepository.remove(account);
    }
}
