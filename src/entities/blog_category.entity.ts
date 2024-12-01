import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StatusBlogEnum } from '@common/enums';

@Entity({ name: 'blog_category' })
export class BlogCategory extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  description: string;

  @Column()
  order: number;

  @Column()
  status: string;
}
