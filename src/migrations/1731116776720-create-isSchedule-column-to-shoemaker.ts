import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateIsScheduleColumnToShoemaker1731116776720 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shoemakers',
      new TableColumn({
        name: 'isSchedule',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('shoemakers', 'isSchedule');
  }
}
