import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from '@entities/index';
import { SearchHistoriesController } from './search-histories.controller';
import { SearchHistoriesService } from './search-histories.service';

@Module({
  imports: [TypeOrmModule.forFeature([SearchHistory])],
  controllers: [SearchHistoriesController],
  providers: [SearchHistoriesService],
})
export class SearchHistoriesModule {}
