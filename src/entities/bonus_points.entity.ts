import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Customer } from './customer.entity';
import { Shoemaker } from './shoemaker.entity';

@Entity({ name: 'bonus_points' })
export class BonusPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Customer, { nullable: true })
  @JoinColumn()
  customer: Customer;

  @Column({ nullable: true, length: 36 })
  customerId: string;

  @OneToOne(() => Shoemaker, { nullable: true })
  @JoinColumn()
  shoemaker: Shoemaker;

  @Column({ nullable: true, length: 36 })
  shoemakerId: string;

  @Column({ default: 0, type: 'int' })
  points: number;
}
