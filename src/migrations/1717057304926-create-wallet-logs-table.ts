import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateWalletLogsTable1717057304926 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wallet_logs',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'walletId',
            type: 'varchar(36)',
          },
          {
            name: 'previousBalance',
            type: 'double',
            isNullable: true,
          },
          {
            name: 'currentBalance',
            type: 'double',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'double',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'transactionDate',
            type: 'datetime',
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

    await queryRunner.createForeignKey(
      'wallet_logs',
      new TableForeignKey({
        columnNames: ['walletId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'wallets',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('wallet_logs');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('walletId') !== -1,
    );
    await queryRunner.dropForeignKey('wallet_logs', foreignKey);
    await queryRunner.dropTable('wallet_logs');
  }
}
