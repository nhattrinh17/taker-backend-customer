import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCustomerVoucherTable1729439384915 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the customer_vouchers table
    await queryRunner.createTable(
      new Table({
        name: 'customer_vouchers',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'customerId',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'voucherId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'timeUse',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime(6)',
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updatedAt',
            type: 'datetime(6)',
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
        ],
      }),
    );

    // Create foreign key for customerId
    await queryRunner.createForeignKey(
      'customer_vouchers',
      new TableForeignKey({
        columnNames: ['customerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'SET NULL',
      }),
    );

    // Create foreign key for voucherId
    await queryRunner.createForeignKey(
      'customer_vouchers',
      new TableForeignKey({
        columnNames: ['voucherId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vouchers',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign keys
    await queryRunner.dropForeignKey('customer_vouchers', 'FK_customerId');
    await queryRunner.dropForeignKey('customer_vouchers', 'FK_voucherId');

    // Drop the table
    await queryRunner.dropTable('customer_vouchers');
  }
}
