import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateBannerColumnToBlog1731591246401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'blogs',
      new TableColumn({
        name: 'banner',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'blogs',
      new TableColumn({
        name: 'runBanner',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('blogs', 'banner');
    await queryRunner.dropColumn('blogs', 'runBanner');
  }
}
