import { PaginationDto } from '@common/decorators';
import { Trip } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface TripRepositoryInterface extends BaseRepositoryInterface<Trip> {
  getTripByConditionAndJoin(condition: object, pagination: PaginationDto, sort?: string, typeSort?: 'ASC' | 'DESC'): Promise<any>;

  getTotalOrderAndSpentByCustomers(customerIds: string[]): Promise<any[]>;

  getTotalOrderAndSpentByShoemaker(shoemakerIds: string[]): Promise<any[]>;

  getShoemakerTopIncome(conditions: object, limit: number): Promise<any>;

  getShoemakerTopActivity(conditions: object, limit: number): Promise<any>;

  getTripByIdAndJoin(id: string): Promise<Trip>;
}
