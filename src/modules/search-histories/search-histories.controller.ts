import { Controller, UseGuards, Version, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomersAuthGuard, ValidationPipe, ICustomer, CurrentUser } from '@common/index';

import { SearchHistoriesService } from './search-histories.service';
import { CreateSearchHistoryDto } from './dto';

@UseGuards(CustomersAuthGuard)
@Controller('search-histories')
export class SearchHistoriesController {
  constructor(private readonly service: SearchHistoriesService) {}

  @Version('1')
  @Post('')
  create(@CurrentUser() user: ICustomer, @Body(new ValidationPipe()) dto: CreateSearchHistoryDto) {
    return this.service.create(user, dto);
  }

  @Version('1')
  @Get('')
  @HttpCode(HttpStatus.OK)
  index(@CurrentUser() user: ICustomer) {
    return this.service.index(user);
  }
}
