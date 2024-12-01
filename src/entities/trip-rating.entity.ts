import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Unique,
} from 'typeorm';
import { BaseEntity, Customer, Shoemaker, Trip } from './index';

@Entity({ name: 'trip_ratings' })
@Unique(['tripId', 'customerId'])
export class TripRating extends BaseEntity {
  @OneToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn()
  trip: Trip;

  @Column({ type: 'varchar', length: 36 })
  tripId: string;

  @ManyToOne(() => Customer, { onDelete: 'SET NULL', nullable: true })
  customer: Customer;

  @Column({ type: 'varchar', length: 36, nullable: true })
  customerId: string;

  @ManyToOne(() => Shoemaker, { onDelete: 'SET NULL', nullable: true })
  shoemaker: Shoemaker;

  @Column({ type: 'varchar', length: 36, nullable: true })
  shoemakerId: string;

  @Column({ type: 'int', default: 0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;
}
