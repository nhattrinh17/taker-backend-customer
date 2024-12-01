import { Controller, Get, HttpCode, Version, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ValidationPipe, CustomersAuthGuard } from '@common/index';

import { SearchService } from './search.service';
import { SearchDto, SearchDetailDto } from './dto/search.dto';

@UseGuards(CustomersAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get('suggestion')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async suggestion(@Query(ValidationPipe) query: SearchDto) {
    return this.service.suggestionByText(query);
  }

  @Get('place-detail')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async searchDetail(@Query(ValidationPipe) query: SearchDetailDto) {
    return this.service.getPlaceDetailV2(query);
  }

  @Get('shoemakers')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async getCloseShoemakers(@Query(ValidationPipe) query: SearchDetailDto) {
    return this.service.getCloseShoemakers(query);
  }
}
