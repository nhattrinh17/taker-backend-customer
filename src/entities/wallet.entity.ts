import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity, Customer, Shoemaker, Transaction } from './index';

@Entity({ name: 'wallets' })
export class Wallet extends BaseEntity {
  @OneToOne(() => Customer, { nullable: true })
  @JoinColumn()
  customer: Customer;

  @Column({ nullable: true, length: 36 })
  customerId: string;

  @OneToOne(() => Shoemaker, { nullable: true })
  @JoinColumn()
  shoemaker: Shoemaker;

  @Column({ nullable: true, length: 36 })
  shoemakerId: string;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];

  @Column({ default: 0, type: 'double' })
  balance: number;
}
