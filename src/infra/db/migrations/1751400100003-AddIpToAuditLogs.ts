import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIpToAuditLogs1751400100003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'audit_logs',
      new TableColumn({ name: 'ip', type: 'varchar', isNullable: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('audit_logs', 'ip');
  }
}
