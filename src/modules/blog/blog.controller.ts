import { Controller, Get, Post, Body, Patch, Param, Delete, Version } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('blogs')
  @Version('1')
  findAll() {
    return this.blogService.findAll();
  }
}
