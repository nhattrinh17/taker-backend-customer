import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTripCancellationsTable1717061384479
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trip_cancellations',
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
            name: 'reason',
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
      'trip_cancellations',
      new TableForeignKey({
        columnNames: ['tripId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trips',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'trip_cancellations',
      new TableForeignKey({
        columnNames: ['customerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'trip_cancellations',
      new TableForeignKey({
        columnNames: ['shoemakerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shoemakers',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('trip_cancellations');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('customerId') !== -1,
    );
    const foreignKey1 = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tripId') !== -1,
    );
    const foreignKey2 = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('shoemakerId') !== -1,
    );
    await queryRunner.dropForeignKey('trip_cancellations', foreignKey);
    await queryRunner.dropForeignKey('trip_cancellations', foreignKey1);
    await queryRunner.dropForeignKey('trip_cancellations', foreignKey2);
    await queryRunner.dropTable('trip_cancellations');
  }
}
