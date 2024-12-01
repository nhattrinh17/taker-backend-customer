import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'admins' })
export class Admin extends BaseEntity {
  @Column({ unique: true })
  userName: string;

  @Column()
  password: string;

  @Column()
  fcmToken: string;

  @Column({ nullable: true })
  lastLoginDate: Date;

  @Column({ nullable: true })
  ipAddress: string;
}
