import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTripServicesTable1717059798590
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trip_services',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'tripId',
            type: 'varchar(36)',
          },
          {
            name: 'serviceId',
            type: 'varchar(36)',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'double',
          },
          {
            name: 'discountPrice',
            type: 'double',
            isNullable: true,
          },
          {
            name: 'discount',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'name',
            type: 'varchar',
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

    await queryRunner.createForeignKey(
      'trip_services',
      new TableForeignKey({
        columnNames: ['tripId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trips',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'trip_services',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'services',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('trip_services');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('serviceId') !== -1,
    );
    const foreignKey1 = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tripId') !== -1,
    );
    await queryRunner.dropForeignKey('trip_services', foreignKey);
    await queryRunner.dropForeignKey('trip_services', foreignKey1);
    await queryRunner.dropTable('trip_services');
  }
}
