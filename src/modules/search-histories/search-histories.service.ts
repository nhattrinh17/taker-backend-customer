import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from '@entities/index';
import { ICustomer, DEFAULT_MESSAGES } from '@common/index';

import { CreateSearchHistoryDto } from './dto';

@Injectable()
export class SearchHistoriesService {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly historyRep: Repository<SearchHistory>,
  ) {}

  async create(user: ICustomer, dto: CreateSearchHistoryDto): Promise<string> {
    try {
      const searchHistory = new SearchHistory();

      searchHistory.name = dto.name;
      searchHistory.address = dto.address;
      searchHistory.customerId = user.sub;
      searchHistory.latitude = dto.latitude;
      searchHistory.longitude = dto.longitude;

      await this.historyRep.save(searchHistory);

      return DEFAULT_MESSAGES.SUCCESS;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  index(user: ICustomer): Promise<SearchHistory[]> {
    return this.historyRep.find({
      select: ['name', 'address', 'latitude', 'longitude'],
      where: { customerId: user.sub },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}
