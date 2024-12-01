import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'point_to_product' })
export class PointToProduct extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  code: string;

  @Column()
  point: number;

  @Column()
  rate: number;
}
