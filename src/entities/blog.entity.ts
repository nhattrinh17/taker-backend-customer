import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BlogCategory } from './blog_category.entity';
import { StatusBlogEnum } from '@common/enums';

@Entity({ name: 'blogs' })
export class Blog extends BaseEntity {
  @ManyToOne(() => BlogCategory, { nullable: true, onDelete: 'SET NULL' })
  blogCategory: BlogCategory;

  @Column({ type: 'varchar', length: 36, nullable: true })
  blogCategoryId: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  title: string;

  @Column()
  image: string;

  @Column()
  typePress: string;

  @Column()
  screenCustomer: string;

  @Column()
  screenShoemaker: string;

  @Column()
  linkNavigate: string;

  @Column()
  order: number;

  @Column()
  status: string;

  @Column()
  isPromotion: boolean;

  @Column()
  banner: string;

  @Column()
  runBanner: boolean;
}
