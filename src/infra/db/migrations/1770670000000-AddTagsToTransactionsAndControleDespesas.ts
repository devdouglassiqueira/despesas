import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTagsToTransactionsAndControleDespesas1770670000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add tags column to transactions table
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "tags" character varying(255)`);
        
        // Add tags column to controle_despesas table
        await queryRunner.query(`ALTER TABLE "controle_despesas" ADD COLUMN IF NOT EXISTS "tags" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "tags"`);
        await queryRunner.query(`ALTER TABLE "controle_despesas" DROP COLUMN IF EXISTS "tags"`);
    }
}
