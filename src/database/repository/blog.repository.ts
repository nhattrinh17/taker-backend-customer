import { Blog } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { BlogRepositoryInterface } from '../interface/blog.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class BlogRepository extends BaseRepositoryAbstract<Blog> implements BlogRepositoryInterface {
  constructor(@InjectRepository(Blog) private readonly blogRepository: Repository<Blog>) {
    super(blogRepository); // Truyền repository vào abstract class
  }
}
