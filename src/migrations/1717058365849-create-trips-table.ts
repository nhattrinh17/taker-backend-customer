import { PaymentEnum, PaymentStatusEnum } from '@common/enums/payment.enum';
import { StatusEnum } from '@common/enums/status.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateTripsTable1717058365849 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trips',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'customerId',
            type: 'varchar(36)',
            isNullable: true,
          },
          {
            name: 'shoemakerId',
            type: 'varchar(36)',
            isNullable: true,
          },
          {
            name: 'orderId',
            type: 'varchar(100)',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [...Object.values(StatusEnum)],
            default: `'${StatusEnum.SEARCHING}'`,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: true, // Index
          },
          {
            name: 'latitude',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'totalPrice',
            type: 'double',
            isNullable: true,
          },
          {
            name: 'images',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'receiveImages',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'completeImages',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'paymentMethod',
            type: 'enum',
            enum: [...Object.values(PaymentEnum)],
            default: `'${PaymentEnum.OFFLINE_PAYMENT}'`,
          },
          {
            name: 'paymentStatus',
            type: 'enum',
            enum: [...Object.values(PaymentStatusEnum)],
            default: `'${PaymentStatusEnum.PENDING}'`,
          },
          {
            name: 'addressNote',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'jobId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'vnPayData',
            type: 'longtext',
            isNullable: true,
          },
          {
            name: 'ipRequest',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'ipIpn',
            type: 'varchar',
            isNullable: true,
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
    );

    await queryRunner.createIndex(
      'trips',
      new TableIndex({
        name: 'IDX_TRIPS_DATE',
        columnNames: ['date'],
      }),
    );

    await queryRunner.createForeignKey(
      'trips',
      new TableForeignKey({
        columnNames: ['customerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'trips',
      new TableForeignKey({
        columnNames: ['shoemakerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shoemakers',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('trips');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('customerId') !== -1,
    );
    const foreignKey1 = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('shoemakerId') !== -1,
    );
    const index1 = table.indices.find(
      (index) => index.columnNames.indexOf('date') !== -1,
    );
    await queryRunner.dropForeignKey('trips', foreignKey);
    await queryRunner.dropForeignKey('trips', foreignKey1);
    await queryRunner.dropIndex('trips', index1);
    await queryRunner.dropTable('trips');
  }
}
