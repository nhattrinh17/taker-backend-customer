import { SystemNotificationRecipientEnum } from '@common/enums';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSystemNotificationsTable1717064815595
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'system_notifications',
        columns: [
          {
            name: 'id',
            type: 'varchar(36)',
            isPrimary: true,
          },
          {
            name: 'title',
            type: 'text',
          },
          {
            name: 'content',
            type: 'longtext',
          },
          {
            name: 'isSent',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sentTime',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'scheduleTime',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'receiver',
            type: 'enum',
            enum: [...Object.values(SystemNotificationRecipientEnum)],
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('system_notifications');
  }
}
