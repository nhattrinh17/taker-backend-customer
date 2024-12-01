import {
  TransactionSource,
  TransactionStatus,
  TransactionType,
} from '@common/enums';
import { BeforeInsert, Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity, Trip, Wallet } from './index';

@Entity({ name: 'transactions' })
export class Transaction extends BaseEntity {
  @ManyToOne(() => Wallet, { onDelete: 'SET NULL', nullable: true })
  wallet: Wallet;

  @Column({ length: 36, nullable: true })
  walletId: string;
  // *The trip that the transaction is related to when the transaction source is TRIP and trip completed
  @ManyToOne(() => Trip, { onDelete: 'SET NULL', nullable: true })
  trip: Trip;

  @Column({ length: 36, nullable: true })
  tripId: string;

  @Column({ length: 36, unique: true })
  orderId: string;

  @Column({ default: 0, type: 'double' })
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Index()
  @Column({ type: 'date', nullable: true })
  transactionDate: Date;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.DEPOSIT,
  })
  transactionType: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionSource,
    default: TransactionSource.WALLET,
  })
  transactionSource: TransactionSource;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true, type: 'longtext' })
  vnPayData: string;

  @Column({ nullable: true })
  ipRequest: string;

  @Column({ nullable: true })
  ipIpn: string;

  @Column({ type: 'boolean', default: false })
  isManual: boolean;

  @Column({ nullable: true })
  evidence: string;

  @BeforeInsert()
  async generateOrderId() {
    this.transactionDate = new Date();
  }
}
