import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateExperienceOnceColumnToService1728621722690 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'services',
      new TableColumn({
        name: 'experienceOnce',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('services', 'experienceOnce');
  }
}
