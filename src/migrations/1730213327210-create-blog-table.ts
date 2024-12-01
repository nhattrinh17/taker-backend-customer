import { StatusBlogEnum } from '@common/enums';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBlogTable1730213327210 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'blogs',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'blogCategoryId',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'typePress',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'screenCustomer',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'screenShoemaker',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'linkNavigate',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'isPromotion',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [...Object.values(StatusBlogEnum)],
            default: `'${StatusBlogEnum.ACTIVE}'`,
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

    // Create foreign key for customerId
    await queryRunner.createForeignKey(
      'blogs',
      new TableForeignKey({
        columnNames: ['blogCategoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'blog_category',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drop foreign key
    await queryRunner.dropForeignKey('blogs', 'FK_blogCategoryId');

    await queryRunner.dropTable('blogs');
  }
}
