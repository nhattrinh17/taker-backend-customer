import { ServiceShoemakerEnum } from '@common/enums';
import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class CreateServiceToShoemaker1730818628774 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shoemakers',
      new TableColumn({
        name: 'serviceShoe',
        type: 'boolean',
        default: true,
      }),
    );

    await queryRunner.addColumn(
      'shoemakers',
      new TableColumn({
        name: 'serviceBike',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'shoemakers',
      new TableColumn({
        name: 'serviceFood',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.createIndex(
      'shoemakers',
      new TableIndex({
        name: 'IDX_SHOEMAKER_serviceShoe',
        columnNames: ['serviceShoe'],
      }),
    );

    await queryRunner.createIndex(
      'shoemakers',
      new TableIndex({
        name: 'IDX_SHOEMAKER_serviceBike',
        columnNames: ['serviceBike'],
      }),
    );

    await queryRunner.createIndex(
      'shoemakers',
      new TableIndex({
        name: 'IDX_SHOEMAKER_serviceFood',
        columnNames: ['serviceFood'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('shoemakers');
    const index1 = table.indices.find((index) => index.columnNames.indexOf('serviceShoe') !== -1);
    const index2 = table.indices.find((index) => index.columnNames.indexOf('serviceFood') !== -1);
    const index3 = table.indices.find((index) => index.columnNames.indexOf('serviceBike') !== -1);
    await queryRunner.dropIndex('shoemakers', index1);
    await queryRunner.dropIndex('shoemakers', index2);
    await queryRunner.dropIndex('shoemakers', index3);
    await queryRunner.dropColumn('shoemakers', 'serviceShoe');
    await queryRunner.dropColumn('shoemakers', 'serviceFood');
    await queryRunner.dropColumn('shoemakers', 'serviceBike');
  }
}
