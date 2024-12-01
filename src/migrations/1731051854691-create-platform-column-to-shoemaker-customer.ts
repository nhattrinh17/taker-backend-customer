import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreatePlatformColumnToShoemakerCustomer1731051854691 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shoemakers',
      new TableColumn({
        name: 'platform',
        type: 'varchar',
        isNullable: true,
        default: `'${'unknown'}'`,
      }),
    );

    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'platform',
        type: 'varchar',
        isNullable: true,
        default: `'${'unknown'}'`,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('shoemakers', 'platform');
    await queryRunner.dropColumn('customers', 'platform');
  }
}
