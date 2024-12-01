import { Blog, BlogCategory } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { BlogCategoryRepositoryInterface } from '../interface/blogCategory.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class BlogCategoryRepository extends BaseRepositoryAbstract<BlogCategory> implements BlogCategoryRepositoryInterface {
  constructor(@InjectRepository(BlogCategory) private readonly blogCategoryRepository: Repository<BlogCategory>) {
    super(blogCategoryRepository); // Truyền repository vào abstract class
  }

  async getAllAndJoinToBlog(): Promise<BlogCategory[]> {
    return this.blogCategoryRepository
      .createQueryBuilder('category')
      .leftJoinAndMapMany(
        'category.blogs', // Tạo mảng blogs trong từng category
        Blog,
        'blog',
        'blog.blogCategoryId = category.id',
      )

      .select([
        //
        'category.id',
        'category.name',
        'category.slug',
        'category.description',
        'category.order',
        'category.status',
        'blog.id',
        'blog.name',
        'blog.slug',
        'blog.title',
        'blog.image',
        'blog.status',
        'blog.typePress',
        'blog.screenCustomer',
        'blog.linkNavigate',
        'blog.order',
        'blog.isPromotion',
        'blog.banner',
        'blog.runBanner',
      ])
      .orderBy('category.order', 'ASC')
      .addOrderBy('blog.order', 'ASC')
      .getMany(); // Sử dụng getMany để lấy dữ liệu dạng entity
  }
}
