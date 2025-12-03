import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AuditLogs1751400100002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'level', type: 'varchar', isNullable: true },
          { name: 'action', type: 'varchar', isNullable: true },
          { name: 'entity', type: 'varchar', isNullable: true },
          {
            name: 'entity_id',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          { name: 'source', type: 'varchar', isNullable: true },
          { name: 'user_id', type: 'int', isNullable: true },
          { name: 'message', type: 'text', isNullable: true },
          {
            name: 'request_id',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          { name: 'context', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON "audit_logs" ("created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON "audit_logs" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON "audit_logs" ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON "audit_logs" ("entity")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
  }
}
