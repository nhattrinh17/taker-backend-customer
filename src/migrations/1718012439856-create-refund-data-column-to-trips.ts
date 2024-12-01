import { PaymentStatusEnum } from '@common/index';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateRefundDataColumnToTrips1718012439856
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'trips',
      new TableColumn({
        name: 'refundData',
        type: 'longtext',
        isNullable: true,
      }),
    );

    await queryRunner.changeColumn('trips', 'paymentStatus', {
      name: 'paymentStatus',
      type: 'enum',
      enum: [...Object.values(PaymentStatusEnum)],
      '@instanceof': undefined,
      isNullable: false,
      isGenerated: false,
      isPrimary: false,
      isUnique: false,
      isArray: false,
      length: '',
      zerofill: false,
      unsigned: false,
      clone: function (): TableColumn {
        throw new Error('Function not implemented.');
      },
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('trips', 'refundData');
    await queryRunner.query(
      `ALTER TABLE trips CHANGE paymentStatus type ENUM('PENDING','PAID','CANCELED', 'REFUNDED', 'REFUNDED_FAILED', 'FAILED', 'EXPIRED');`,
    );
  }
}
