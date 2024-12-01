import { NotificationTypeEnum } from '@common/enums';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Customer } from './customer.entity';
import { SystemNotification } from './index';
import { Shoemaker } from './shoemaker.entity';

@Entity({ name: 'notifications' })
export class Notification extends BaseEntity {
  @ManyToOne(() => Shoemaker, { nullable: true, onDelete: 'CASCADE' })
  shoemaker: Shoemaker;

  @Column({ nullable: true, type: 'varchar', length: 36 })
  shoemakerId: string;

  @ManyToOne(() => Customer, { nullable: true, onDelete: 'CASCADE' })
  customer: Customer;

  @Column({ nullable: true, type: 'varchar', length: 36 })
  customerId: string;

  @ManyToOne(() => SystemNotification, { nullable: true, onDelete: 'SET NULL' })
  systemNotification: SystemNotification;

  @Column({ nullable: true })
  systemNotificationId: string;

  @Column()
  title: string;

  @Column({ type: 'longtext', nullable: true })
  content: string;

  @Column({ type: 'longtext', nullable: true })
  data: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({
    type: 'enum',
    enum: NotificationTypeEnum,
    default: NotificationTypeEnum.USER,
  })
  type: NotificationTypeEnum;
}
