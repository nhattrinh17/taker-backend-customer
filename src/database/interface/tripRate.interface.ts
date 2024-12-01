import { TripRating } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface TripRatingRepositoryInterface extends BaseRepositoryInterface<TripRating> {
  getAvengeRateShoemakersByCondition(condition: object, limit: number): Promise<any>;

  getTotalRateAndAverageByShoemakerIs(shoemakerIds: string[]): Promise<
    {
      //
      shoemakerId: string;
      totalRatings: number;
      averageRating: number;
    }[]
  >;
}
