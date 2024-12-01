import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateEvidenceToTransactions1722050445489
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'evidence',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('transactions', 'evidence');
  }
}
