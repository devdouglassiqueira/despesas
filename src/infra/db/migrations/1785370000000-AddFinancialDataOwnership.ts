import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFinancialDataOwnership1785370000000
  implements MigrationInterface
{
  name = 'AddFinancialDataOwnership1785370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "user_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "user_id" integer`,
    );

    await queryRunner.query(`
      UPDATE "accounts"
      SET "user_id" = (
        SELECT "id" FROM "users"
        WHERE "deleted_at" IS NULL
        ORDER BY "id" ASC
        LIMIT 1
      )
      WHERE "user_id" IS NULL
    `);
    await queryRunner.query(`
      UPDATE "transactions" AS transaction
      SET "user_id" = COALESCE(
        (SELECT account."user_id" FROM "accounts" AS account
         WHERE account."id" = transaction."account_id"),
        (SELECT "id" FROM "users"
         WHERE "deleted_at" IS NULL
         ORDER BY "id" ASC
         LIMIT 1)
      )
      WHERE transaction."user_id" IS NULL
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_accounts_user_id" ON "accounts" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_transactions_user_id" ON "transactions" ("user_id")`,
    );
    await queryRunner.query(`
      ALTER TABLE "accounts"
      ADD CONSTRAINT "FK_accounts_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE RESTRICT
    `);
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "FK_transactions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "FK_accounts_user"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_transactions_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_accounts_user_id"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN IF EXISTS "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN IF EXISTS "user_id"`,
    );
  }
}
