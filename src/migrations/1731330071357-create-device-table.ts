import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateDeviceTable1731330071357 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'devices',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'deviceId',
            type: 'varchar',
          },
          {
            name: 'deviceId2',
            type: 'varchar',
          },
          {
            name: 'manufacturer',
            type: 'varchar(255)',
          },
          {
            name: 'name',
            type: 'varchar(255)',
          },

          {
            name: 'memory',
            type: 'int',
          },
          {
            name: 'model',
            type: 'varchar',
          },

          {
            name: 'systemName',
            type: 'varchar',
          },
          {
            name: 'deviceType',
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
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('devices');
  }
}
