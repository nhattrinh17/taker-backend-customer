import { TripService } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface TripServiceRepositoryInterface extends BaseRepositoryInterface<TripService> {
  getDataDashboard(startDate: string, endDate: string): Promise<any>;
}
