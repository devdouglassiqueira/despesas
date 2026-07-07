import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
} from 'typeorm';

export class CreateContatosAndCategoriasTables1770680000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureTable(queryRunner, 'contatos');
    await this.ensureTable(queryRunner, 'categorias');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('contatos')) {
      await queryRunner.dropTable('contatos');
    }

    if (await queryRunner.hasTable('categorias')) {
      await queryRunner.dropTable('categorias');
    }
  }

  private async ensureTable(
    queryRunner: QueryRunner,
    tableName: 'contatos' | 'categorias',
  ) {
    const exists = await queryRunner.hasTable(tableName);

    if (!exists) {
      await queryRunner.createTable(
        new Table({
          name: tableName,
          columns: [
            {
              name: 'id',
              type: 'serial',
              isPrimary: true,
            },
            {
              name: 'nome',
              type: 'varchar',
              isNullable: false,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'now()',
              isNullable: false,
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'now()',
              isNullable: false,
            },
            {
              name: 'deleted_at',
              type: 'timestamp',
              isNullable: true,
            },
          ],
        }),
      );

      return;
    }

    const table = await queryRunner.getTable(tableName);

    if (!table?.findColumnByName('nome')) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'nome',
          type: 'varchar',
          isNullable: false,
          default: "''",
        }),
      );
    }

    if (!table?.findColumnByName('created_at')) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'created_at',
          type: 'timestamp',
          default: 'now()',
          isNullable: false,
        }),
      );
    }

    if (!table?.findColumnByName('updated_at')) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()',
          isNullable: false,
        }),
      );
    }

    if (!table?.findColumnByName('deleted_at')) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'deleted_at',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }
  }
}
