import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class ModernizeTransactionsCategories1770645594263 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create Categories Table
        await queryRunner.createTable(new Table({
            name: "categories",
            columns: [
                { name: "id", type: "serial", isPrimary: true },
                { name: "name", type: "varchar", length: "100" },
                { name: "color", type: "varchar", length: "20", isNullable: true },
                { name: "icon", type: "varchar", length: "50", isNullable: true },
                { name: "type", type: "varchar", length: "20" }, // income, expense
                { name: "parent_id", type: "int", isNullable: true },
                { name: "created_at", type: "timestamp", default: "now()" },
                { name: "updated_at", type: "timestamp", default: "now()" },
            ]
        }), true);

        await queryRunner.createForeignKey("categories", new TableForeignKey({
            columnNames: ["parent_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "categories",
            onDelete: "SET NULL"
        }));

        // 2. Create Accounts Table
        await queryRunner.createTable(new Table({
            name: "accounts",
            columns: [
                { name: "id", type: "serial", isPrimary: true },
                { name: "name", type: "varchar", length: "100" },
                { name: "type", type: "varchar", length: "50" }, // wallet, bank, credit_card
                { name: "initial_balance", type: "decimal", precision: 10, scale: 2, default: 0 },
                { name: "color", type: "varchar", length: "20", isNullable: true },
                { name: "created_at", type: "timestamp", default: "now()" },
                { name: "updated_at", type: "timestamp", default: "now()" },
            ]
        }), true);

        // 3. Create Transactions Table
        await queryRunner.createTable(new Table({
            name: "transactions",
            columns: [
                { name: "id", type: "serial", isPrimary: true },
                { name: "description", type: "varchar", length: "255" },
                { name: "amount", type: "decimal", precision: 10, scale: 2 },
                { name: "type", type: "varchar", length: "20" }, // income, expense
                { name: "date", type: "timestamp" },
                { name: "status", type: "varchar", length: "20", default: "'paid'" }, // paid, pending
                { name: "category_id", type: "int", isNullable: true },
                { name: "account_id", type: "int", isNullable: true },
                { name: "payment_method", type: "varchar", length: "50", isNullable: true },
                { name: "due_date", type: "timestamp", isNullable: true },
                { name: "notes", type: "text", isNullable: true },
                { name: "created_at", type: "timestamp", default: "now()" },
                { name: "updated_at", type: "timestamp", default: "now()" },
            ]
        }), true);

        await queryRunner.createForeignKey("transactions", new TableForeignKey({
            columnNames: ["category_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "categories",
            onDelete: "SET NULL"
        }));

        await queryRunner.createForeignKey("transactions", new TableForeignKey({
            columnNames: ["account_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "accounts",
            onDelete: "SET NULL"
        }));

        // 4. Create Budgets Table
        await queryRunner.createTable(new Table({
            name: "budgets",
            columns: [
                { name: "id", type: "serial", isPrimary: true },
                { name: "category_id", type: "int" },
                { name: "amount", type: "decimal", precision: 10, scale: 2 },
                { name: "period", type: "varchar", length: "20" }, // monthly, yearly
                { name: "created_at", type: "timestamp", default: "now()" },
                { name: "updated_at", type: "timestamp", default: "now()" },
            ]
        }), true);

        await queryRunner.createForeignKey("budgets", new TableForeignKey({
            columnNames: ["category_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "categories",
            onDelete: "CASCADE"
        }));

        // 5. Create Recurring Rules Table
        await queryRunner.createTable(new Table({
            name: "recurring_rules",
            columns: [
                { name: "id", type: "serial", isPrimary: true },
                { name: "transaction_template_id", type: "int", isNullable: true }, // Logic to be implemented later
                { name: "pattern", type: "varchar", length: "50" }, // cron or simple string
                { name: "next_run", type: "timestamp" },
                { name: "active", type: "boolean", default: true },
                { name: "created_at", type: "timestamp", default: "now()" },
                { name: "updated_at", type: "timestamp", default: "now()" },
            ]
        }), true);

        // 6. Create Attachments Table
        await queryRunner.createTable(new Table({
            name: "attachments",
            columns: [
                { name: "id", type: "serial", isPrimary: true },
                { name: "transaction_id", type: "int" },
                { name: "url", type: "varchar", length: "500" },
                { name: "metadata", type: "jsonb", isNullable: true },
                { name: "created_at", type: "timestamp", default: "now()" },
            ]
        }), true);

        await queryRunner.createForeignKey("attachments", new TableForeignKey({
            columnNames: ["transaction_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "transactions",
            onDelete: "CASCADE"
        }));


        // --- SEEDING & MIGRATION ---

        // Seed default categories
        await queryRunner.query(`
            INSERT INTO categories (name, type, color, icon) VALUES
            ('Alimentação', 'expense', '#ff9800', 'fastfood'),
            ('Transporte', 'expense', '#2196f3', 'commute'),
            ('Moradia', 'expense', '#4caf50', 'home'),
            ('Lazer', 'expense', '#9c27b0', 'sports_esports'),
            ('Saúde', 'expense', '#f44336', 'local_hospital'),
            ('Educação', 'expense', '#3f51b5', 'school'),
            ('Salário', 'income', '#8bc34a', 'attach_money'),
            ('Investimentos', 'income', '#009688', 'trending_up'),
            ('Outros', 'expense', '#607d8b', 'category');
        `);

        // Seed default account
        await queryRunner.query(`
            INSERT INTO accounts (name, type, color) VALUES
            ('Carteira', 'wallet', '#607d8b'),
            ('Conta Bancária', 'bank', '#3f51b5');
        `);

        // Migrate existing 'despesas' to 'transactions'
        // Assumes structure: despesas (valor, descricao, tipo, forma_pagamento, created_at, updated_at) from entity file
        // We will try to map category based on description or just put in 'Outros'
        const outrosCategory = await queryRunner.query("SELECT id FROM categories WHERE name = 'Outros' LIMIT 1");
        const carteiraAccount = await queryRunner.query("SELECT id FROM accounts WHERE name = 'Carteira' LIMIT 1");

        const catId = outrosCategory[0]?.id || null;
        const accId = carteiraAccount[0]?.id || null;

        // Check if 'despesas' table exists and has data
        const oldTableExists = await queryRunner.hasTable("despesas");
        if (oldTableExists) {
            const oldDespesas = await queryRunner.query("SELECT * FROM despesas");
            for (const despesa of oldDespesas) {
                // Determine type (if stored as string 'entrada'/'saida', convert to 'income'/'expense' if needed, 
                // but entity says 'tipo' is just string, likely 'Alimentação' as example in entity file suggests it might be category-like)
                // Entity says: example: 'Alimentação', description: 'Tipo da compra'. So 'tipo' in old table is actually CATEGORY.
                // Entity says: example: 'Mercado', description: 'Descrição da compra'.
                // There is no explicit income/expense type in old 'despesas' table shown in entity? 
                // Wait, let's check Despesas entity again.
                // Despesas entity: valor, descricao, tipo, forma_pagamento.
                // Docs say: tipo example 'Alimentação'. So it's a category.
                // Assuming all are expenses for now as the table name is 'despesas' (expenses).

                let transactionType = 'expense';
                let categoryId = catId;

                // Try to find category by name
                if (despesa.tipo) {
                    const foundCat = await queryRunner.query(`SELECT id FROM categories WHERE name = '${despesa.tipo}' LIMIT 1`);
                    if (foundCat && foundCat.length > 0) {
                        categoryId = foundCat[0].id;
                    } else {
                        // Create new category from old type if it doesn't exist
                        const newCat = await queryRunner.query(`INSERT INTO categories (name, type, color, icon) VALUES ('${despesa.tipo}', 'expense', '#607d8b', 'category') RETURNING id`);
                        categoryId = newCat[0].id;
                    }
                }

                await queryRunner.query(`
                    INSERT INTO transactions (description, amount, type, date, status, category_id, account_id, payment_method, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `, [
                    despesa.descricao,
                    despesa.valor,
                    transactionType,
                    despesa.created_at || new Date(),
                    'paid', // assume paid
                    categoryId,
                    accId,
                    despesa.forma_pagamento,
                    despesa.created_at || new Date(),
                    despesa.updated_at || new Date()
                ]);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("attachments");
        await queryRunner.dropTable("recurring_rules");
        await queryRunner.dropTable("budgets");
        await queryRunner.dropTable("transactions");
        await queryRunner.dropTable("accounts");
        await queryRunner.dropTable("categories");
    }

}
