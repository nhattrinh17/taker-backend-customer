import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTripLogsTable1718617187388 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trip_logs',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'tripId',
            type: 'varchar(36)',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar(100)',
            isNullable: true,
          },
          {
            name: 'data',
            type: 'longtext',
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
      'trip_logs',
      new TableForeignKey({
        columnNames: ['tripId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trips',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('trip_logs');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tripId') !== -1,
    );
    await queryRunner.dropForeignKey('trip_logs', foreignKey);
    await queryRunner.dropTable('trip_logs');
  }
}
