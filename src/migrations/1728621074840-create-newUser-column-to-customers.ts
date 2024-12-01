import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateNewUserColumnToCustomers1728621074840 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'newUser',
        type: 'boolean',
        isNullable: false,
        default: true, // Hoặc "true" tùy theo database (Postgres sử dụng true, MySQL dùng '1')
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('customers', 'newUser');
  }
}
