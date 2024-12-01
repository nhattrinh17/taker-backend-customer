import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateWalletsTable1717056465920 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
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
            name: 'balance',
            type: 'double',
            default: 0,
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
      'wallets',
      new TableForeignKey({
        columnNames: ['customerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'wallets',
      new TableForeignKey({
        columnNames: ['shoemakerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shoemakers',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('wallets');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('customerId') !== -1,
    );
    const foreignKey1 = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('shoemakerId') !== -1,
    );
    await queryRunner.dropForeignKey('wallets', foreignKey);
    await queryRunner.dropForeignKey('wallets', foreignKey1);
    await queryRunner.dropTable('wallets');
  }
}
