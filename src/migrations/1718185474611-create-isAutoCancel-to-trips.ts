import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateIsAutoCancelToTrips1718185474611
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'trips',
      new TableColumn({
        name: 'isAutoCancel',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('trips', 'isAutoCancel');
  }
}
