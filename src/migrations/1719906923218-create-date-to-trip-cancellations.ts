import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class CreateDateToTripCancellations1719906923218
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'trip_cancellations',
      new TableColumn({
        name: 'date',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'trip_cancellations',
      new TableIndex({
        name: 'IDX_TRIP_CANCELLATIONS_DATE',
        columnNames: ['date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'trip_cancellations',
      'IDX_TRIP_CANCELLATIONS_DATE',
    );
    await queryRunner.dropColumn('trip_cancellations', 'date');
  }
}
