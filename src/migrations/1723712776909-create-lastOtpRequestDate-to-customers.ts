import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateLastOtpRequestDateToCustomers1723712776909
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'lastOtpRequestDate',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'customers',
      new TableColumn({
        name: 'otpRequestCount',
        type: 'int',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('customers', 'lastOtpRequestDate');
    await queryRunner.dropColumn('customers', 'otpRequestCount');
  }
}
