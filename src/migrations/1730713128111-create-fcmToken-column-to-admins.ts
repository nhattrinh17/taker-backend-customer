import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateFcmTokenColumnToAdmins1730713128111 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'admins',
      new TableColumn({
        name: 'fcmToken',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('admins', 'address');
  }
}
