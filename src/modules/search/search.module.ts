import { Module } from '@nestjs/common';
import { SearchService as GoogleSearchService } from '@common/index';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, GoogleSearchService],
})
export class SearchModule {}
