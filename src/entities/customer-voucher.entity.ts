import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Voucher } from './voucher.entity';
import { Customer } from './customer.entity';

@Entity({ name: 'customer_vouchers' })
export class CustomerVoucher extends BaseEntity {
  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'varchar', length: 36, nullable: true })
  customerId: string;

  @ManyToOne(() => Voucher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voucherId' })
  voucher: Voucher;

  @Column()
  voucherId: string;

  @Column({ nullable: true })
  timeUse: Date;
}
