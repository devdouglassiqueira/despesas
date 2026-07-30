import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { AccountsService } from '../services/accounts.service';
import { CreateAccountDto, UpdateAccountDto } from '../domain/dto/create-account.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) { }

    @Post()
    create(@Body() createAccountDto: CreateAccountDto, @Req() request: Request) {
        return this.accountsService.create(createAccountDto, (request as any).user.id);
    }

    @Get()
    findAll(@Req() request: Request) {
        return this.accountsService.findAll((request as any).user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() request: Request) {
        return this.accountsService.findOne(+id, (request as any).user.id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto, @Req() request: Request) {
        return this.accountsService.update(+id, updateAccountDto, (request as any).user.id);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() request: Request) {
        return this.accountsService.remove(+id, (request as any).user.id);
    }
}
