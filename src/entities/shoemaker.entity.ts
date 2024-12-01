import { ShoemakerStatusEnum } from '@common/enums/status.enum';
import { StepEnum } from '@common/enums/step.enum';
import { Column, DeleteDateColumn, Entity, Index, ManyToOne, OneToOne } from 'typeorm';

import { BaseEntity, Device, RatingSummary, Wallet } from './';

@Entity({ name: 'shoemakers' })
export class Shoemaker extends BaseEntity {
  @OneToOne(() => Wallet, (wallet) => wallet.shoemaker, { cascade: true })
  wallet: Wallet;

  @OneToOne(() => RatingSummary, (rating) => rating.shoemaker)
  rating: RatingSummary;

  @Column({ unique: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: ShoemakerStatusEnum,
    default: ShoemakerStatusEnum.PENDING,
  })
  status: ShoemakerStatusEnum;

  @Column({})
  serviceShoe: boolean;

  @Column({})
  serviceBike: boolean;

  @Column({})
  serviceFood: boolean;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ type: 'enum', enum: StepEnum, default: StepEnum.OTP })
  step: StepEnum;

  @Column({ nullable: true })
  fcmToken: string;

  @Index()
  @Column({ nullable: true })
  referralCode: string;

  @Column({ nullable: true })
  registrationDate: Date;

  @Column({ nullable: true })
  lastLoginDate: Date;

  // using socket to update status
  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: false })
  isTrip: boolean;

  @Column({ default: false })
  isSchedule: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  latitude: string;

  @Column({ nullable: true })
  longitude: string;

  @Index()
  @Column({ nullable: true })
  latLongToCell: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  identityCard: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  accountName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  placeOfOrigin: string;

  @Column({ nullable: true })
  placeOfResidence: string;

  @Column({ nullable: true })
  maritalStatus: string;

  @Column({ nullable: true })
  workRegistrationArea: string;

  @Column({ nullable: true })
  frontOfCardImage: string;

  @Column({ nullable: true })
  backOfCardImage: string;

  // Soft delete
  @DeleteDateColumn({ type: 'datetime' })
  deletedAt: Date;

  // isOn that means is ready to take a new order
  @Column({ default: true })
  isOn: boolean;

  @Column({ type: 'int', default: 0 })
  otpRequestCount: number;

  @Column({ type: 'date', nullable: true })
  lastOtpRequestDate: Date;

  @Column({ nullable: true })
  platform: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE', nullable: true })
  device: Device;

  @Column({ nullable: true, length: 36 })
  deviceId: string;
}
