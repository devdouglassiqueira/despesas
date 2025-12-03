import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, IsNull } from 'typeorm';

import { CreateDespesasDto } from '../domain/dto/create-despesas.dto';
import { UpdateDespesasDto } from '../domain/dto/update-despesas.dto';
import { Despesas } from '../domain/despesas.entity';

@Injectable()
export class DespesasService {
  constructor(
    @InjectRepository(Despesas)
    private readonly despesasRepository: Repository<Despesas>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createDespesasDto: CreateDespesasDto) {
    const { valor, descricao, tipo, formaPagamento } = createDespesasDto;
    const despesas = new Despesas({
      valor,
      descricao,
      tipo,
      formaPagamento,
    });
    return await this.entityManager.save(despesas);
  }

  async findAll() {
    const despesas = await this.despesasRepository.find({
      select: {
        id: true,
        valor: true,
        descricao: true,
        tipo: true,
        formaPagamento: true,
        createdAt: true,
        deletedAt: true,
      },
      where: {
        deletedAt: IsNull(),
      },
      order: {
        tipo: 'ASC',
      },
    });

    if (!despesas.length) {
      throw new HttpException('Nenhuma despesa encontrada', 404);
    }

    return despesas;
  }

  async findAllFilter() {
    // Busca usando QueryBuilder
    const despesas = await this.despesasRepository
      .createQueryBuilder('despesa')
      .select([
        'despesa.id',
        'despesa.valor',
        'despesa.descricao',
        'despesa.tipo',
        'despesa.formaPagamento',
        'despesa.createdAt',
        'despesa.deletedAt',
      ])
      .where('despesa.deletedAt IS NULL')
      .orderBy('despesa.tipo', 'ASC')
      .addOrderBy('despesa.createdAt', 'DESC')
      .getMany();

    if (!despesas.length) {
      throw new HttpException('Nenhuma despesa encontrada', 404);
    }

    // helper pra converter string -> number
    const toNumber = (valor: any): number => {
      if (typeof valor === 'number') return valor;

      if (typeof valor === 'string') {
        const normalizado = valor.replace(',', '.');
        const num = Number(normalizado);
        return isNaN(num) ? 0 : num;
      }

      return 0;
    };

    // ---------- TOTAL GERAL ----------
    const totalGeral = despesas.reduce((acc, despesa) => {
      return acc + toNumber(despesa.valor);
    }, 0);

    // ---------- TOTAL POR TIPO + FORMAS DE PAGAMENTO ----------
    const porTipoMap = new Map<
      string,
      {
        total: number;
        itens: typeof despesas;
        formas: Map<string, number>;
      }
    >();

    despesas.forEach((despesa) => {
      const tipo = despesa.tipo;
      const forma = despesa.formaPagamento || 'Não informado';
      const valorNumber = toNumber(despesa.valor);

      if (!porTipoMap.has(tipo)) {
        porTipoMap.set(tipo, {
          total: 0,
          itens: [],
          formas: new Map<string, number>(),
        });
      }

      const tipoEntry = porTipoMap.get(tipo)!;

      // soma no total do tipo
      tipoEntry.total += valorNumber;
      tipoEntry.itens.push(despesa);

      // soma no total da forma de pagamento dentro desse tipo
      const totalFormaAtual = tipoEntry.formas.get(forma) ?? 0;
      tipoEntry.formas.set(forma, totalFormaAtual + valorNumber);
    });

    const porTipo = Array.from(porTipoMap.entries()).map(
      ([tipo, { total, itens, formas }]) => ({
        tipo,
        total,
        itens, // todos os itens desse tipo, juntos
        porFormaPagamento: Array.from(formas.entries()).map(
          ([formaPagamento, totalForma]) => ({
            formaPagamento,
            total: totalForma,
          }),
        ),
      }),
    );

    // ---------- RETORNO FINAL ----------
    return {
      totalGeral,
      porTipo,
    };
  }

  async findOne(id: number) {
    if (!id) {
      throw new HttpException('Id da despesa necessário!', 400);
    }

    const despesas = await this.despesasRepository.findOne({
      select: {
        id: true,
        valor: true,
        descricao: true,
        tipo: true,
        formaPagamento: true,
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

  async update(id: number, updateDespesasDto: UpdateDespesasDto) {
    if (!id) {
      throw new HttpException('Id da despesa necessário!', 400);
    }

    const despesas = await this.entityManager.findOneBy(Despesas, { id });
    if (!despesas) {
      throw new HttpException('Nenhum operador encontrado', 404);
    }

    Object.assign(despesas, updateDespesasDto);

    return await this.entityManager.save(despesas);
  }

  async delete(id: number) {
    if (!id) {
      throw new HttpException('Id da despesa necessário!', 400);
    }

    const despesas = await this.entityManager.findOneBy(Despesas, { id });
    if (!despesas) {
      throw new HttpException('Nenhuma despesa encontrada!', 404);
    }

    Object.assign(despesas, { deletedAt: new Date() });

    return await this.entityManager.save(despesas);
  }
}
