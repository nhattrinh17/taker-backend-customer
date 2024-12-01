import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateIsManualColumnToTransactions1718098372126
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'isManual',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('transactions', 'isManual');
  }
}
