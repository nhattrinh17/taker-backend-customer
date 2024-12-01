import { Column, DeleteDateColumn, Entity, Index, ManyToOne, OneToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Wallet } from './wallet.entity';
import { Device } from './device.entity';

@Entity({ name: 'customers' })
export class Customer extends BaseEntity {
  @OneToOne(() => Wallet, (wallet) => wallet.customer, { cascade: true })
  wallet: Wallet;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Index()
  @Column({ nullable: true })
  referralCode: string;

  @Column({ nullable: true })
  registrationDate: Date;

  @Column({ nullable: true })
  lastLoginDate: Date;

  @Column({ default: false })
  isLogin: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  bankAccountName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'int', default: 0 })
  otpRequestCount: number;

  @Column({ type: 'date', nullable: true })
  lastOtpRequestDate: Date;

  @Column({ default: true })
  newUser: boolean;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  platform: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE', nullable: true })
  device: Device;

  @Column({ nullable: true, length: 36 })
  deviceId: string;

  // Soft delete
  @DeleteDateColumn({ type: 'datetime' })
  deletedAt: Date;
}
