import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity, Wallet } from './index';

@Entity({ name: 'wallet_logs' })
export class WalletLog extends BaseEntity {
  @ManyToOne(() => Wallet, { onDelete: 'SET NULL', nullable: true })
  wallet: Wallet;

  @Column({ nullable: true, length: 36 })
  walletId: string;

  @Column({ nullable: true, type: 'double' })
  previousBalance: number;

  @Column({ nullable: true, type: 'double' })
  currentBalance: number;

  @Column({ nullable: true })
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'datetime', nullable: true })
  transactionDate: Date;

  @BeforeInsert()
  setTransactionDate() {
    this.transactionDate = new Date();
  }
}
