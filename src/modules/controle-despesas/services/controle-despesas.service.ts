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
  ) { }

  async create(createDespesasDto: CreateControleDespesasDto) {
    const { valor, descricao, tipo, contato, categoria, data } =
      createDespesasDto;

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
      contato,
      categoria,
      data: data || new Date(),
    });

    return await this.despesasRepository.save(controleDespesas);
  }

  async getReport(startDate: string, endDate: string) {
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);

    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    // 1. Calcular Saldo Anterior (Soma de tudo antes do startDate)
    const { totalEntradasAnterior } = await this.despesasRepository
      .createQueryBuilder('despesas')
      .select('SUM(CAST(despesas.valor AS NUMERIC))', 'totalEntradasAnterior')
      .where('despesas.tipo = :tipo', { tipo: 'entrada' })
      .andWhere('despesas.data < :start', { start })
      .andWhere('despesas.deletedAt IS NULL')
      .getRawOne();

    const { totalSaidasAnterior } = await this.despesasRepository
      .createQueryBuilder('despesas')
      .select('SUM(CAST(despesas.valor AS NUMERIC))', 'totalSaidasAnterior')
      .where('despesas.tipo IN (:...tipos)', { tipos: ['saida', 'saída'] })
      .andWhere('despesas.data < :start', { start })
      .andWhere('despesas.deletedAt IS NULL')
      .getRawOne();

    const saldoAnterior =
      (Number(totalEntradasAnterior) || 0) - (Number(totalSaidasAnterior) || 0);

    // 2. Buscar Transações no Período
    const transacoes = await this.despesasRepository
      .createQueryBuilder('despesas')
      .where('despesas.data >= :start', { start })
      .andWhere('despesas.data <= :end', { end })
      .andWhere('despesas.deletedAt IS NULL')
      .orderBy('despesas.data', 'ASC')
      .addOrderBy('despesas.createdAt', 'ASC')
      .getMany();

    // 3. Calcular Totais do Período
    let totalEntradasPeriodo = 0;
    let totalSaidasPeriodo = 0;

    transacoes.forEach((t) => {
      if (t.tipo === 'entrada') {
        totalEntradasPeriodo += Number(t.valor);
      } else {
        totalSaidasPeriodo += Number(t.valor);
      }
    });

    const saldoFinal =
      saldoAnterior + totalEntradasPeriodo - totalSaidasPeriodo;

    return {
      saldoAnterior,
      totalEntradas: totalEntradasPeriodo,
      totalSaidas: totalSaidasPeriodo,
      saldoFinal,
      transacoes,
    };
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
        contato: true,
        categoria: true,
        data: true,
      },
      where: {
        deletedAt: IsNull(),
      },
      order: {
        data: 'DESC',
      },
    });

    // Retorna array vazio em vez de 404
    return despesas;
  }

  async findOne(id: number) {
    if (!id) {
      throw new HttpException('Id da despesa necessário!', 400);
    }

    const despesa = await this.despesasRepository.findOne({
      select: {
        id: true,
        saldo: true,
        valor: true,
        descricao: true,
        tipo: true,
        createdAt: true,
        deletedAt: true,
        contato: true,
        categoria: true,
        data: true,
      },
      where: {
        id, // <-- Corrigido: Agora usa o ID passado
        deletedAt: IsNull(),
      },
    });

    if (!despesa) {
      throw new HttpException('Nenhuma despesa encontrada', 404);
    }

    return despesa;
  }

  async update(
    id: number,
    updateControleDespesasDto: UpdateControleDespesasDto,
  ) {
    if (!id) {
      throw new HttpException('Id da despesa necessário!', 400);
    }

    const despesa = await this.despesasRepository.findOneBy({ id });
    if (!despesa) {
      throw new HttpException('Transação não encontrada', 404);
    }

    Object.assign(despesa, updateControleDespesasDto);

    return await this.despesasRepository.save(despesa);
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
