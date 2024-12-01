import { ShareType } from '@common/enums/service.enum';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'services' })
export class Service extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'double' })
  price: number;

  @Column({ type: 'double', nullable: true })
  discountPrice: number;

  @Column({ type: 'float', nullable: true })
  discount: number;

  @Column({ nullable: true })
  icon: string;

  @Column({
    type: 'enum',
    enum: ShareType,
    default: ShareType.PERCENTAGE,
  })
  shareType: ShareType;

  @Column({ type: 'double', default: 0.8 })
  share: number;

  @Column({ default: false })
  experienceOnce: boolean;
}
