import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity, Customer } from './index';

@Entity({ name: 'search_histories' })
export class SearchHistory extends BaseEntity {
  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  customer: Customer;

  @Column({ type: 'varchar', length: 36 })
  customerId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  latitude: string;

  @Column({ type: 'varchar', length: 100 })
  longitude: string;
}
