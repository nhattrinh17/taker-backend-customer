import { TransactionLogStatus } from '@common/enums';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './index';

@Entity({ name: 'transaction_logs' })
export class TransactionLog extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TransactionLogStatus,
    default: TransactionLogStatus.FAILED,
  })
  status: TransactionLogStatus;

  @Column({ nullable: true, type: 'longtext' })
  vnPayData: string;

  @Column({ nullable: true })
  ipIpn: string;

  @Index()
  @Column({ nullable: true, type: 'date' })
  date: Date;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  message: string;
}
