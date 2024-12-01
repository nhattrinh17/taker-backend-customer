import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateTripRatingsTable1717060393402 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trip_ratings',
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
            name: 'rating',
            type: 'int',
            default: 0,
          },
          {
            name: 'comment',
            type: 'text',
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

    await queryRunner.createForeignKey(
      'trip_ratings',
      new TableForeignKey({
        columnNames: ['tripId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trips',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'trip_ratings',
      new TableForeignKey({
        columnNames: ['customerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'trip_ratings',
      new TableForeignKey({
        columnNames: ['shoemakerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shoemakers',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'trip_ratings',
      new TableIndex({
        name: 'IDX_TRIP_RATINGS_TRIP_CUSTOMER',
        columnNames: ['tripId', 'customerId'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('trip_ratings');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('customerId') !== -1,
    );
    const foreignKey1 = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tripId') !== -1,
    );
    const foreignKey2 = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('shoemakerId') !== -1,
    );
    await queryRunner.dropForeignKey('trip_ratings', foreignKey);
    await queryRunner.dropForeignKey('trip_ratings', foreignKey1);
    await queryRunner.dropForeignKey('trip_ratings', foreignKey2);
    await queryRunner.dropIndex(
      'trip_ratings',
      'IDX_TRIP_RATINGS_TRIP_CUSTOMER',
    );
    await queryRunner.dropTable('trip_ratings');
  }
}
