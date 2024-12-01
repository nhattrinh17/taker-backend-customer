import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCategory } from '@entities/blog_category.entity';
import { BlogCategoryRepository } from 'src/database/repository/blogCategory.repository';
import RedisService from '@common/services/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogCategory])],
  controllers: [BlogController],
  providers: [
    BlogService,
    {
      provide: 'BlogCategoryRepositoryInterface',
      useClass: BlogCategoryRepository,
    },
    RedisService,
  ],
})
export class BlogModule {}
