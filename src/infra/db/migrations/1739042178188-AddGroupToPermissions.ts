import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGroupToPermissions1739042178188 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'permissions',
      new TableColumn({
        name: 'group',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('permissions', 'group');
  }
}
