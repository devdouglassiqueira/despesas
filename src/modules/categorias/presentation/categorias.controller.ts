import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriasService } from '../services/categorias.service';
import { CreateCategoriaDto } from '../domain/dto/create-categoria.dto';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';

@ApiTags('Categorias')
@PermissionsGroup('Categorias')
@Controller('categorias')
export class CategoriasController {
    constructor(private readonly categoriasService: CategoriasService) { }

    @Post()
    //@Permissions('criar_categoria') // Assumindo permissão livre ou existente para facilitar
    async create(@Body() createCategoriaDto: CreateCategoriaDto) {
        return await this.categoriasService.create(createCategoriaDto);
    }

    @Get()
    //@Permissions('listar_categorias')
    async findAll() {
        return await this.categoriasService.findAll();
    }
}
