import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMissingColumnsToControleDespesas1770660000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists first
        const tableExists = await queryRunner.hasTable('controle_despesas');
        if (!tableExists) {
            console.log('Table controle_despesas does not exist, skipping migration');
            return;
        }

        // Check if columns already exist before adding
        const table = await queryRunner.getTable('controle_despesas');

        if (!table?.findColumnByName('contato')) {
            await queryRunner.addColumn(
                'controle_despesas',
                new TableColumn({
                    name: 'contato',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                }),
            );
        }

        if (!table?.findColumnByName('categoria')) {
            await queryRunner.addColumn(
                'controle_despesas',
                new TableColumn({
                    name: 'categoria',
                    type: 'varchar',
                    length: '100',
                    isNullable: true,
                }),
            );
        }

        if (!table?.findColumnByName('data')) {
            await queryRunner.addColumn(
                'controle_despesas',
                new TableColumn({
                    name: 'data',
                    type: 'timestamp',
                    default: 'now()',
                    isNullable: false,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('controle_despesas');
        if (!tableExists) {
            return;
        }

        const table = await queryRunner.getTable('controle_despesas');

        if (table?.findColumnByName('contato')) {
            await queryRunner.dropColumn('controle_despesas', 'contato');
        }

        if (table?.findColumnByName('categoria')) {
            await queryRunner.dropColumn('controle_despesas', 'categoria');
        }

        if (table?.findColumnByName('data')) {
            await queryRunner.dropColumn('controle_despesas', 'data');
        }
    }
}
