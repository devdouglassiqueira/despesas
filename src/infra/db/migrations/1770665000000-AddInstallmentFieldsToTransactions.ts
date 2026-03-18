import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddInstallmentFieldsToTransactions1770665000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("transactions", [
            new TableColumn({
                name: "installment_number",
                type: "int",
                isNullable: true,
            }),
            new TableColumn({
                name: "installment_total",
                type: "int",
                isNullable: true,
            }),
            new TableColumn({
                name: "parent_id",
                type: "int",
                isNullable: true,
            }),
            new TableColumn({
                name: "is_recurring",
                type: "boolean",
                default: false,
            }),
        ]);

        await queryRunner.createForeignKey("transactions", new TableForeignKey({
            columnNames: ["parent_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "transactions",
            onDelete: "SET NULL"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("transactions");
        if (table) {
            const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("parent_id") !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey("transactions", foreignKey);
            }
        }
        await queryRunner.dropColumns("transactions", ["installment_number", "installment_total", "parent_id", "is_recurring"]);
    }

}
