import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, IsNull } from 'typeorm';
import { LogsService } from 'src/modules/logs/services/logs.service';

import { CreateDadosDiscordDto } from '../domain/dto/create-dados-discord.dto';
import { UpdateDadosDiscordDto } from '../domain/dto/update-dados-discord.dto';
import { DadosDiscord } from '../domain/dados-discord.entity';

@Injectable()
export class DadosDiscordService {
  constructor(
    @InjectRepository(DadosDiscord)
    private readonly dadosDiscordRepository: Repository<DadosDiscord>,
    private readonly entityManager: EntityManager,
    private readonly logsService: LogsService,
  ) {}

  async create(createDadosDiscordDto: CreateDadosDiscordDto, userId?: number) {
    const { operador, telefone, email, password, status } =
      createDadosDiscordDto;

    const emailExist = await this.entityManager.findOne(DadosDiscord, {
      where: { email },
    });

    const operadorExist = await this.entityManager.findOne(DadosDiscord, {
      where: { operador },
    });

    if (emailExist || operadorExist) {
      if (emailExist && operadorExist) {
        throw new HttpException('Operador e Email já cadastrados', 409);
      }

      if (emailExist) {
        throw new HttpException('Email já cadastrado', 409);
      }

      if (operadorExist) {
        throw new HttpException('Operador já cadastrado', 409);
      }
    }

    const dadosDiscord = new DadosDiscord({
      operador,
      telefone,
      email,
      password,
      status,
    });

    const saved = await this.entityManager.save(dadosDiscord);

    await this.logsService.createAuditLog({
      action: 'CREATE',
      entity: 'DadosDiscord',
      entityId: saved.id.toString(),
      message: `Operador ${saved.operador} criado (ID=${saved.id})`,
      userId: userId ?? null,
      context: {
        before: null,
        after: saved,
      },
    });

    return saved;
  }

  async findAll() {
    const dados = await this.dadosDiscordRepository.find({
      select: {
        id: true,
        operador: true,
        telefone: true,
        password: true,
        email: true,
        status: true,
        createdAt: true,
        deletedAt: true,
      },
      where: {
        deletedAt: IsNull(),
      },
      order: {
        status: 'ASC',
        operador: 'ASC',
      },
    });

    if (!dados.length) {
      throw new HttpException('Nenhum operador encontrado', 404);
    }

    return dados.sort((a, b) => {
      if (a.status === b.status) {
        return a.operador.localeCompare(b.operador);
      }
      return a.status === 'inactive' ? 1 : -1;
    });
  }

  async findOne(id: number) {
    if (!id) {
      throw new HttpException('Id do operador necessário', 400);
    }

    const dados = await this.dadosDiscordRepository.findOne({
      select: {
        id: true,
        operador: true,
        telefone: true,
        email: true,
        status: true,
        createdAt: true,
        deletedAt: true,
      },
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!dados) {
      throw new HttpException('Nenhum operador encontrado', 404);
    }

    return { dados };
  }

  async update(
    id: number,
    updateDadosDiscordDto: UpdateDadosDiscordDto,
    userId?: number,
  ) {
    if (!id) {
      throw new HttpException('Id do operador necessário', 400);
    }

    const dados = await this.entityManager.findOneBy(DadosDiscord, { id });
    if (!dados) {
      throw new HttpException('Nenhum operador encontrado', 404);
    }
    const { operador, email } = updateDadosDiscordDto;

    if (email) {
      const emailExist = await this.entityManager.findOne(DadosDiscord, {
        where: { email },
      });
      if (emailExist && emailExist.id !== id) {
        throw new HttpException('Email já cadastrado', 409);
      }
    }

    if (operador) {
      const operadorExist = await this.entityManager.findOne(DadosDiscord, {
        where: { operador },
      });
      if (operadorExist && operadorExist.id !== id) {
        throw new HttpException('Operador já cadastrado', 409);
      }
    }

    const before = { ...dados };

    Object.assign(dados, updateDadosDiscordDto);

    const updated = await this.entityManager.save(dados);
    await this.logsService.createAuditLog({
      action: 'UPDATE',
      entity: 'DadosDiscord',
      entityId: updated.id.toString(),
      message: `Operador ${updated.operador} atualizado (ID=${updated.id})`,
      userId: userId ?? null,
      context: {
        before,
        after: updated,
      },
    });

    return updated;
  }

  async delete(id: number) {
    if (!id) {
      throw new HttpException('Id do operador necessário', 400);
    }

    const dados = await this.entityManager.findOneBy(DadosDiscord, { id });
    if (!dados) {
      throw new HttpException('Nenhum operador encontrado', 404);
    }

    Object.assign(dados, { deletedAt: new Date() });

    return await this.entityManager.save(dados);
  }
}
