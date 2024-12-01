import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateSearchHistoriesTable1717064424565
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'search_histories',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'customerId',
            type: 'varchar(36)',
          },
          {
            name: 'name',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
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
      'search_histories',
      new TableForeignKey({
        columnNames: ['customerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('search_histories');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('customerId') !== -1,
    );

    await queryRunner.dropForeignKey('search_histories', foreignKey);
    await queryRunner.dropTable('search_histories');
  }
}
