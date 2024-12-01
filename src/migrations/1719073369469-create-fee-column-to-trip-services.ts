import { ShareType } from '@common/enums/service.enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateFeeColumnToTripServices1719073369469
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'trip_services',
      new TableColumn({
        name: 'shareType',
        type: 'enum',
        enum: [...Object.values(ShareType)],
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'trip_services',
      new TableColumn({
        name: 'share',
        type: 'double',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('trip_services', 'shareType');
    await queryRunner.dropColumn('trip_services', 'share');
  }
}
