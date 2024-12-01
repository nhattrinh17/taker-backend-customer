import {
  TransactionSource,
  TransactionStatus,
  TransactionType,
} from '@common/enums';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateTransactionsTable1717062564093
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'walletId',
            type: 'varchar(36)',
            isNullable: true,
          },
          {
            name: 'tripId',
            type: 'varchar(36)',
            isNullable: true,
          },
          {
            name: 'orderId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'amount',
            type: 'double',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'transactionDate',
            type: 'date', // Index
            isNullable: true,
          },
          {
            name: 'transactionType',
            type: 'enum',
            enum: [...Object.values(TransactionType)],
            default: `'${TransactionType.DEPOSIT}'`,
          },
          {
            name: 'transactionSource',
            type: 'enum',
            enum: [...Object.values(TransactionSource)],
            default: `'${TransactionSource.WALLET}'`,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [...Object.values(TransactionStatus)],
            default: `'${TransactionStatus.PENDING}'`,
          },
          {
            name: 'vnPayData',
            type: 'longtext',
            isNullable: true,
          },
          {
            name: 'ipRequest',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'ipIpn',
            type: 'varchar',
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

    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_TRANSACTIONS_DATE',
        columnNames: ['transactionDate'],
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['tripId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trips',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['walletId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'wallets',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('transactions');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('walletId') !== -1,
    );
    const foreignKey1 = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tripId') !== -1,
    );
    await queryRunner.dropForeignKey('transactions', foreignKey);
    await queryRunner.dropForeignKey('transactions', foreignKey1);
    await queryRunner.dropIndex('transactions', 'IDX_TRANSACTIONS_DATE');
    await queryRunner.dropTable('transactions');
  }
}
