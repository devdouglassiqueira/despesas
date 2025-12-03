import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ApiLogs1751400100001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'api_logs',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'level', type: 'varchar', isNullable: true },
          { name: 'method', type: 'varchar', isNullable: true },
          { name: 'url', type: 'text', isNullable: true },
          { name: 'status_code', type: 'int', isNullable: true },
          { name: 'duration_ms', type: 'int', isNullable: true },
          { name: 'user_id', type: 'int', isNullable: true },
          {
            name: 'request_id',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          { name: 'controller', type: 'varchar', isNullable: true },
          { name: 'handler', type: 'varchar', isNullable: true },
          { name: 'ip', type: 'varchar', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'params', type: 'jsonb', isNullable: true },
          { name: 'query', type: 'jsonb', isNullable: true },
          { name: 'body', type: 'jsonb', isNullable: true },
          { name: 'error_name', type: 'varchar', isNullable: true },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'stack', type: 'text', isNullable: true },
          { name: 'message', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON "api_logs" ("created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_api_logs_request_id ON "api_logs" ("request_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON "api_logs" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_api_logs_method ON "api_logs" ("method")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('api_logs');
  }
}
