import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity, Trip } from './index';

@Entity({ name: 'trip_logs' })
export class TripLog extends BaseEntity {
  @ManyToOne(() => Trip, { onDelete: 'SET NULL', nullable: true })
  trip: Trip;

  @Column({ nullable: true, length: 36 })
  tripId: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true, type: 'longtext' })
  data: string;
}
