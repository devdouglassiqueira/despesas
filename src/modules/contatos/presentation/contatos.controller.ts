import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContatosService } from '../services/contatos.service';
import { CreateContatoDto } from '../domain/dto/create-contato.dto';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';

@ApiTags('Contatos')
@PermissionsGroup('Contatos')
@Controller('contatos')
export class ContatosController {
    constructor(private readonly contatosService: ContatosService) { }

    @Post()
    //@Permissions('criar_contato')
    async create(@Body() createContatoDto: CreateContatoDto) {
        return await this.contatosService.create(createContatoDto);
    }

    @Get()
    //@Permissions('listar_contatos')
    async findAll() {
        return await this.contatosService.findAll();
    }
}
