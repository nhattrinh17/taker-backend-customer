import { SystemNotificationRecipientEnum } from '@common/enums';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Notification } from './index';

@Entity({ name: 'system_notifications' })
export class SystemNotification extends BaseEntity {
  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isSent: boolean;

  @Column({ type: 'datetime', nullable: true })
  sentTime: Date;

  @Column({ type: 'bigint', nullable: true })
  scheduleTime: number;

  @Column({ type: 'enum', enum: SystemNotificationRecipientEnum })
  receiver: SystemNotificationRecipientEnum;

  @OneToMany(() => Notification, (n) => n.systemNotification)
  notifications: Notification;
}
