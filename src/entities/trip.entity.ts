import {
  PaymentEnum,
  PaymentStatusEnum,
  StatusEnum,
  generateTripId,
} from '@common/index';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity, Customer, Shoemaker, TripRating, TripService } from './';

@Entity({ name: 'trips' })
export class Trip extends BaseEntity {
  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  customer: Customer;

  @Column({ type: 'varchar', length: 36, nullable: true })
  customerId: string;

  @ManyToOne(() => Shoemaker, { nullable: true, onDelete: 'SET NULL' })
  shoemaker: Shoemaker;

  @Column({ type: 'varchar', length: 36, nullable: true })
  shoemakerId: string;

  @OneToMany(() => TripService, (tripService) => tripService.trip, {
    cascade: true,
  })
  services: TripService[];

  @OneToOne(() => TripRating, (tripRating) => tripRating.trip)
  rating: TripRating;

  @Column({ type: 'varchar', length: 100, unique: true })
  orderId: string;

  @Column({ type: 'enum', enum: StatusEnum, default: StatusEnum.SEARCHING })
  status: StatusEnum;

  @Index()
  @Column({ type: 'date', nullable: true })
  date: Date;

  // *Location of the customer who requested the service
  @Column({ nullable: true })
  latitude: string;

  @Column({ nullable: true })
  longitude: string;

  @Column({ nullable: true })
  address: string;

  // *The total price of the services requested by the customer
  @Column({ nullable: true, type: 'double' })
  totalPrice: number;
  // *The fee that the taker will receive
  @Column({ nullable: true, type: 'double' })
  fee: number;

  // *The income that the shoemaker will receive
  @Column({ default: 0, type: 'double' })
  income: number;

  // *Images of products before the service
  @Column('simple-array', { nullable: true })
  images: string[];

  // *Images of products which shoemaker will receive before fixing
  @Column('simple-array', { nullable: true })
  receiveImages: string[];

  // *Images of products after the service
  @Column('simple-array', { nullable: true })
  completeImages: string[];

  // *Payment status of the trip
  @Column({
    type: 'enum',
    enum: PaymentEnum,
    default: PaymentEnum.OFFLINE_PAYMENT,
  })
  paymentMethod: PaymentEnum;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  paymentStatus: PaymentStatusEnum;

  // *The note which the customer wants to add to the address
  @Column({ nullable: true, type: 'text' })
  addressNote: string;

  // *Bull job id to check the status of the job
  @Column({ nullable: true })
  jobId: string;

  @Column({ nullable: true, type: 'longtext' })
  vnPayData: string;

  @Column({ nullable: true, type: 'longtext' })
  refundData: string;

  @Column({ nullable: true })
  ipRequest: string;

  @Column({ nullable: true })
  ipIpn: string;

  @Column({ type: 'boolean', default: false })
  isAutoCancel: boolean;

  @Column({ type: 'bigint', nullable: true })
  scheduleTime: number;

  @BeforeInsert()
  async generateOrderId() {
    this.orderId = generateTripId();
    this.date = new Date();
  }
}
