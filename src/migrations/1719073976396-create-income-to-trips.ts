import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateIncomeToTrips1719073976396 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'trips',
      new TableColumn({
        name: 'income',
        type: 'double',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('trips', 'income');
  }
}
