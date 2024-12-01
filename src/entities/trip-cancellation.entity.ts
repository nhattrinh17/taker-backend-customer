import { BeforeInsert, Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity, Customer, Shoemaker, Trip } from './index';

@Entity({ name: 'trip_cancellations' })
export class TripCancellation extends BaseEntity {
  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  trip: Trip;

  @Column({ type: 'varchar', length: 36 })
  tripId: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE', nullable: true })
  customer: Customer;

  @Column({ type: 'varchar', length: 36, nullable: true })
  customerId: string;

  @ManyToOne(() => Shoemaker, { onDelete: 'CASCADE', nullable: true })
  shoemaker: Shoemaker;

  @Column({ type: 'varchar', length: 36, nullable: true })
  shoemakerId: string;

  @Column({ nullable: true, type: 'text' })
  reason: string;

  @Index()
  @Column({ type: 'date', nullable: true })
  date: Date;

  @BeforeInsert()
  setDate() {
    this.date = new Date();
  }
}
