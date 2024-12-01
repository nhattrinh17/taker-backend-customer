import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Shoemaker } from './shoemaker.entity';

@Entity({ name: 'rating_summaries' })
export class RatingSummary extends BaseEntity {
  @OneToOne(() => Shoemaker, { onDelete: 'CASCADE' })
  @JoinColumn()
  shoemaker: Shoemaker;

  @Column({ type: 'varchar', length: 36 })
  shoemakerId: string;

  @Column({ type: 'float' })
  average: number;

  @Column({ type: 'int' })
  count: number;
}
