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

    create(createAccountDto: CreateAccountDto) {
        const account = this.accountRepository.create(createAccountDto);
        return this.accountRepository.save(account);
    }

    findAll() {
        return this.accountRepository.find({ order: { name: 'ASC' } });
    }

    async findOne(id: number) {
        const account = await this.accountRepository.findOne({ where: { id } });
        if (!account) {
            throw new NotFoundException(`Account with ID ${id} not found`);
        }
        return account;
    }

    async update(id: number, updateAccountDto: UpdateAccountDto) {
        const account = await this.findOne(id);
        this.accountRepository.merge(account, updateAccountDto);
        return this.accountRepository.save(account);
    }

    async remove(id: number) {
        const account = await this.findOne(id);
        return this.accountRepository.remove(account);
    }
}
