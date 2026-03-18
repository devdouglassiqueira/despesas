import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Categoria } from '../domain/categoria.entity';
import { CreateCategoriaDto } from '../domain/dto/create-categoria.dto';

@Injectable()
export class CategoriasService {
    constructor(
        @InjectRepository(Categoria)
        private readonly categoriasRepository: Repository<Categoria>,
    ) { }

    async create(createCategoriaDto: CreateCategoriaDto) {
        const existing = await this.categoriasRepository.findOne({
            where: {
                nome: createCategoriaDto.nome,
                deletedAt: IsNull(),
            }
        });

        if (existing) {
            return existing;
        }

        const categoria = this.categoriasRepository.create(createCategoriaDto);
        return await this.categoriasRepository.save(categoria);
    }

    async findAll() {
        return await this.categoriasRepository.find({
            where: { deletedAt: IsNull() },
            order: { nome: 'ASC' },
        });
    }
}
