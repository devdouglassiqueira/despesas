import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Contato } from '../domain/contato.entity';
import { CreateContatoDto } from '../domain/dto/create-contato.dto';

@Injectable()
export class ContatosService {
    constructor(
        @InjectRepository(Contato)
        private readonly contatosRepository: Repository<Contato>,
    ) { }

    async create(createContatoDto: CreateContatoDto) {
        const existing = await this.contatosRepository.findOne({
            where: {
                nome: createContatoDto.nome,
                deletedAt: IsNull(),
            }
        });

        if (existing) {
            return existing;
        }

        const contato = this.contatosRepository.create(createContatoDto);
        return await this.contatosRepository.save(contato);
    }

    async findAll() {
        return await this.contatosRepository.find({
            where: { deletedAt: IsNull() },
            order: { nome: 'ASC' },
        });
    }
}
