import { ShareType } from '@common/enums/service.enum';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity, Service, Trip } from './index';

@Entity({ name: 'trip_services' })
export class TripService extends BaseEntity {
  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  trip: Trip;

  @Column({ type: 'varchar', length: 36 })
  tripId: string;

  @ManyToOne(() => Service, { onDelete: 'SET NULL', nullable: true })
  service: Service;

  @Column({ type: 'varchar', length: 36, nullable: true })
  serviceId: string;

  @Column({ type: 'double' })
  price: number;

  @Column({ nullable: true, type: 'double' })
  discountPrice: number;

  @Column({ nullable: true, type: 'float' })
  discount: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({})
  name: string;

  @Column({
    type: 'enum',
    enum: ShareType,
    nullable: true,
  })
  shareType: ShareType;

  @Column({ type: 'double', nullable: true })
  share: number;
}
