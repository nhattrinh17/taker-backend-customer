import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Customer } from './customer.entity';
import { Shoemaker } from './shoemaker.entity';
import { BonusPoint } from './bonus_points.entity';

@Entity({ name: 'bonus_point_logs' })
export class BonusPointLog extends BaseEntity {
  @OneToOne(() => BonusPoint, { nullable: true })
  @JoinColumn()
  bonusPoint: BonusPoint;

  @Column({ nullable: true, length: 36 })
  bonusPointId: string;

  @Column({ type: 'int' })
  previousPoints: number;

  @Column({ type: 'int' })
  newPoints: number;

  @Column({ type: 'int' })
  pointsChanged: number;

  @Column()
  description: string;
}
