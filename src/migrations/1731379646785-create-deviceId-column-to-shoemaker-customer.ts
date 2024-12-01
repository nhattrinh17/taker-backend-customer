import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class CreateDeviceIdColumnToShoemakerCustomer1731379646785 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shoemakers',
      new TableColumn({
        name: 'deviceId',
        type: 'varchar(36)',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'deviceId',
        type: 'varchar(36)',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'shoemakers',
      new TableForeignKey({
        columnNames: ['deviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'devices',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'customers',
      new TableForeignKey({
        columnNames: ['deviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'devices',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('shoemakers', 'deviceId');
    await queryRunner.dropColumn('customers', 'deviceId');
  }
}
