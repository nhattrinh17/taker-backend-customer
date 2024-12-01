import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'devices' })
export class Device extends BaseEntity {
  @Column()
  deviceId: string;

  @Column()
  deviceId2: string;

  @Column()
  manufacturer: string;

  @Column()
  name: string;

  @Column()
  memory: number;

  @Column()
  model: string;

  @Column()
  systemName: string;

  @Column()
  deviceType: string;
}
