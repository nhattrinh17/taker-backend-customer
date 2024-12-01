import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateLastOtpRequestDateToShoemakers1723712165406
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shoemakers',
      new TableColumn({
        name: 'lastOtpRequestDate',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'shoemakers',
      new TableColumn({
        name: 'otpRequestCount',
        type: 'int',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('shoemakers', 'lastOtpRequestDate');
    await queryRunner.dropColumn('shoemakers', 'otpRequestCount');
  }
}
