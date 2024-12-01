import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateFeeColumnToTrips1717993414001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'trips',
      new TableColumn({
        name: 'fee',
        type: 'double',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('trips', 'fee');
  }
}
