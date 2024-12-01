import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateScheduleTimeToTrips1718462760303
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'trips',
      new TableColumn({
        name: 'scheduleTime',
        type: 'bigint',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('trips', 'scheduleTime');
  }
}
