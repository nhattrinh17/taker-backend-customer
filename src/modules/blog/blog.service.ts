import { Inject, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogCategoryRepositoryInterface } from 'src/database/interface/blogCategory.interface';
import Redis from 'ioredis';
import RedisService from '@common/services/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlogService {
  constructor(
    @Inject('BlogCategoryRepositoryInterface')
    private readonly blogCategoryRepository: BlogCategoryRepositoryInterface,
    private readonly redis: RedisService,
    private configService: ConfigService,
  ) {}

  async findAll() {
    const keyRedis = 'data-blog';
    let data: any = [];
    const dataRedis = await this.redis.get(keyRedis);
    console.log('🚀 ~ BlogService ~ findAll ~ dataRedis:', dataRedis);
    if (dataRedis) {
      data = JSON.parse(dataRedis);
    } else {
      data = await this.blogCategoryRepository.getAllAndJoinToBlog();
      await this.redis.setExpire(keyRedis, JSON.stringify(data), 60);
    }
    return {
      data,
    };
  }
}
