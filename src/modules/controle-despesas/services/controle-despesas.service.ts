import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, IsNull } from 'typeorm';

import { CreateControleDespesasDto } from '../domain/dto/create-controle-despesas.dto';
import { UpdateControleDespesasDto } from '../domain/dto/update-controle-despesas.dto';
import { ControleDespesas } from '../domain/controle-despesas.entity';

@Injectable()
export class ControleDespesasService {
  constructor(
    @InjectRepository(ControleDespesas)
    private readonly despesasRepository: Repository<ControleDespesas>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createDespesasDto: CreateControleDespesasDto) {
    const { valor, descricao, tipo } = createDespesasDto;

    // Garantir número
    const valorNumber = Number(valor);
    if (Number.isNaN(valorNumber)) {
      throw new BadRequestException('Valor inválido');
    }

    // Pega o último registro (saldo anterior)
    const ultimoRegistro = await this.despesasRepository.findOne({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' }, // ou id: 'DESC'
    });

    const saldoAnterior = ultimoRegistro ? Number(ultimoRegistro.saldo) : 0;

    let saldoAtual: number;

    const tipoNormalizado = tipo.toLowerCase();

    if (tipoNormalizado === 'entrada') {
      saldoAtual = saldoAnterior + valorNumber;
    } else if (tipoNormalizado === 'saida' || tipoNormalizado === 'saída') {
      saldoAtual = saldoAnterior - valorNumber;
    } else {
      throw new BadRequestException(
        'Tipo da transação inválido. Use "entrada" ou "saida".',
      );
    }

    const controleDespesas = this.despesasRepository.create({
      saldo: saldoAtual.toFixed(2),
      valor: valorNumber.toFixed(2),
      descricao,
      tipo,
    });

    return await this.despesasRepository.save(controleDespesas);
  }
  async findAll() {
    const despesas = await this.despesasRepository.find({
      select: {
        id: true,
        saldo: true,
        valor: true,
        descricao: true,
        tipo: true,
        createdAt: true,
        deletedAt: true,
      },
      where: {
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'ASC', // importante pra ver a evolução do saldo
      },
    });

    if (!despesas.length) {
      throw new HttpException('Nenhuma despesa encontrada', 404);
    }

    return despesas;
  }

  async findOne(id: number) {
    if (!id) {
      throw new HttpException('Id da despesa necessário!', 400);
    }

    const despesas = await this.despesasRepository.findOne({
      select: {
        id: true,
        saldo: true,
        valor: true,
        descricao: true,
        tipo: true,
        createdAt: true,
        deletedAt: true,
      },
      where: {
        deletedAt: IsNull(),
      },
    });

    if (!despesas) {
      throw new HttpException('Nenhuma despesa encontrada', 404);
    }

    return despesas;
  }

  async update(
    id: number,
    updateControleDespesasDto: UpdateControleDespesasDto,
  ) {
    if (!id) {
      throw new HttpException('Id da despesa necessário!', 400);
    }

    const despesas = await this.entityManager.findOneBy(ControleDespesas, {
      id,
    });
    if (!despesas) {
      throw new HttpException('Nenhum operador encontrado', 404);
    }

    Object.assign(despesas, updateControleDespesasDto);

    return await this.entityManager.save(despesas);
  }

  async delete(id: number) {
    if (!id) {
      throw new HttpException('Id da despesa necessário!', 400);
    }

    const despesas = await this.entityManager.findOneBy(ControleDespesas, {
      id,
    });
    if (!despesas) {
      throw new HttpException('Nenhuma despesa encontrada!', 404);
    }

    Object.assign(despesas, { deletedAt: new Date() });

    return await this.entityManager.save(despesas);
  }
}
