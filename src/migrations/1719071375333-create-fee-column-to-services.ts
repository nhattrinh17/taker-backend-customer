import { ShareType } from '@common/enums/service.enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CreateFeeColumnToServices1719071375333
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'services',
      new TableColumn({
        name: 'shareType',
        type: 'enum',
        enum: [...Object.values(ShareType)],
        default: `'${ShareType.PERCENTAGE}'`,
      }),
    );

    await queryRunner.addColumn(
      'services',
      new TableColumn({
        name: 'share',
        type: 'double',
        default: 0.8,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('services', 'shareType');
    await queryRunner.dropColumn('services', 'share');
  }
}
