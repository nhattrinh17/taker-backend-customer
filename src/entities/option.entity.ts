import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'options' })
export class Option extends BaseEntity {
  @Column()
  key: string;

  @Column({ nullable: true })
  value: string;
}
