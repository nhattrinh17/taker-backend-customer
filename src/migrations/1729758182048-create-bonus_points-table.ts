import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBonusPointsTable1729758182048 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng bonus_points
    await queryRunner.createTable(
      new Table({
        name: 'bonus_points',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isUnique: true,
          },
          {
            name: 'customerId',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'shoemakerId',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'points',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Khóa ngoại cho customerId liên kết với bảng customers
    await queryRunner.createForeignKey(
      'bonus_points',
      new TableForeignKey({
        columnNames: ['customerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'CASCADE',
      }),
    );

    // Khóa ngoại cho shoemakerId liên kết với bảng shoemakers
    await queryRunner.createForeignKey(
      'bonus_points',
      new TableForeignKey({
        columnNames: ['shoemakerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shoemakers',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Lấy các khóa ngoại trước khi xóa chúng
    const table = await queryRunner.getTable('bonus_points');
    const customerForeignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('customerId') !== -1);
    const shoemakerForeignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('shoemakerId') !== -1);

    // Xóa các khóa ngoại
    await queryRunner.dropForeignKey('bonus_points', customerForeignKey);
    await queryRunner.dropForeignKey('bonus_points', shoemakerForeignKey);

    // Xóa bảng bonus_points
    await queryRunner.dropTable('bonus_points');
  }
}
