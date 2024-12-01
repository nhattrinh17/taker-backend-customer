import { VoucherTypeEnum } from '@common/enums/voucher.enum';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateVoucherTable1729434776737 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vouchers',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar(255)',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'code',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'paymentMethod',
            type: 'varchar',
          },
          {
            name: 'discount',
            type: 'double',
          },
          {
            name: 'typeDiscount',
            type: 'enum',
            enum: [...Object.values(VoucherTypeEnum)],
            default: `'${VoucherTypeEnum.PERCENT}'`,
          },
          {
            name: 'discountToUp',
            type: 'double',
            isNullable: true,
          },
          {
            name: 'minimumOrder',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'totalUse',
            type: 'int',
            default: 0,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'icon',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'startTime',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'endTime',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
          },

          {
            name: 'isGlobal',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'datetime(6)',
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updatedAt',
            type: 'datetime(6)',
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'vouchers',
      new TableIndex({
        name: 'IDX_VOUCHER_TYPE',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'vouchers',
      new TableIndex({
        name: 'IDX_VOUCHER_CODE',
        columnNames: ['code'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('vouchers', 'IDX_VOUCHER_TYPE');
    await queryRunner.dropIndex('vouchers', 'IDX_VOUCHER_CODE');
    await queryRunner.dropTable('vouchers');
  }
}
