import { TransactionLogStatus } from '@common/enums';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTransactionLogsTable1717063886040
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transaction_logs',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [...Object.values(TransactionLogStatus)],
            default: `'${TransactionLogStatus.FAILED}'`,
          },
          {
            name: 'vnPayData',
            type: 'longtext',
            isNullable: true,
          },
          {
            name: 'ipIpn',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'transactionId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'message',
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
      'transaction_logs',
      new TableIndex({
        name: 'IDX_TRANSACTION_LOGS_DATE',
        columnNames: ['date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'transaction_logs',
      'IDX_TRANSACTION_LOGS_DATE',
    );
    await queryRunner.dropTable('transaction_logs');
  }
}
