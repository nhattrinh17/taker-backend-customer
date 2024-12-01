import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBonusPointLogsTable1729758666033 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bonus_point_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'bonusPointId',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'previousPoints',
            type: 'int',
          },
          {
            name: 'newPoints',
            type: 'int',
          },
          {
            name: 'pointsChanged',
            type: 'int',
          },
          {
            name: 'description',
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
      true,
    );

    await queryRunner.createForeignKey(
      'bonus_point_logs',
      new TableForeignKey({
        columnNames: ['bonusPointId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'bonus_points',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('bonus_point_logs');
    const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('bonusPointId') !== -1);

    // Xóa khóa ngoại trước khi xóa bảng
    await queryRunner.dropForeignKey('bonus_point_logs', foreignKey);
    await queryRunner.dropTable('bonus_point_logs');
  }
}
