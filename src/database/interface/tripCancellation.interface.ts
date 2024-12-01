import { PaginationDto } from '@common/decorators';
import { TripCancellation } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface TripCancellationRepositoryInterface extends BaseRepositoryInterface<TripCancellation> {
  getTripCannelByConditionAndJoin(condition: object, pagination: PaginationDto): Promise<any>;

  getDataShoemakerCancel(condition: object, limit: number): Promise<any>;
}
