import { TripRating } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { TripRatingRepositoryInterface } from '../interface/tripRate.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class TripRatingRepository extends BaseRepositoryAbstract<TripRating> implements TripRatingRepositoryInterface {
  constructor(@InjectRepository(TripRating) private readonly tripRatingRepository: Repository<TripRating>) {
    super(tripRatingRepository); // Truyền repository vào abstract class
  }

  getAvengeRateShoemakersByCondition(condition: object, limit: number): Promise<any> {
    return this.tripRatingRepository
      .createQueryBuilder('tripRating')
      .leftJoinAndSelect('tripRating.shoemaker', 'shoemaker')
      .select('tripRating.shoemakerId', 'shoemakerId')
      .addSelect('shoemaker.fullName', 'shoemakerName')
      .addSelect('shoemaker.phone', 'shoemakerPhone')
      .addSelect('shoemaker.registrationDate', 'shoemakerRegistrationDate')
      .addSelect('AVG(tripRating.rating)', 'averageRating')
      .addSelect('DATEDIFF(CURRENT_DATE, shoemaker.registrationDate)', 'daysSinceRegistration')
      .where(condition)
      .groupBy('tripRating.shoemakerId')
      .addGroupBy('shoemaker.fullName')
      .addGroupBy('shoemaker.phone')
      .addGroupBy('shoemaker.registrationDate')
      .orderBy('averageRating', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getTotalRateAndAverageByShoemakerIs(shoemakerIds: string[]): Promise<{ shoemakerId: string; totalRatings: number; averageRating: number }[]> {
    const result = await this.tripRatingRepository
      .createQueryBuilder('tripRating')
      .select('tripRating.shoemakerId', 'shoemakerId')
      .addSelect('COUNT(tripRating.rating)', 'totalRatings')
      .addSelect('AVG(tripRating.rating)', 'averageRating')
      .where('tripRating.shoemakerId IN (:...shoemakerIds)', { shoemakerIds })
      .groupBy('tripRating.shoemakerId')
      .getRawMany();

    return result;
  }
}
