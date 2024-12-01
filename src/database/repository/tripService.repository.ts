import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripService } from '@entities/index';
import { TripServiceRepositoryInterface } from '../interface/tripService.interface';
import { BaseRepositoryAbstract } from 'src/base';
import { StatusEnum } from '@common/enums';

@Injectable()
export class TripServiceRepository extends BaseRepositoryAbstract<TripService> implements TripServiceRepositoryInterface {
  constructor(
    @InjectRepository(TripService)
    private readonly tripServiceRepository: Repository<TripService>,
  ) {
    super(tripServiceRepository);
  }

  async getDataDashboard(startDate: string, endDate: string): Promise<any> {
    const queryBuilder = this.tripServiceRepository
      .createQueryBuilder('tripService')
      .leftJoin('tripService.trip', 'trip')
      .leftJoin('tripService.service', 'service')
      .where('trip.status = :status', { status: StatusEnum.COMPLETED })
      .andWhere('tripService.serviceId IS NOT NULL')
      .select('tripService.serviceId', 'serviceId')
      .addSelect('service.name', 'serviceName')
      .addSelect('COUNT(tripService.id)', 'totalOrders')
      .addSelect('SUM(tripService.price * tripService.quantity)', 'totalRevenue')
      .groupBy('tripService.serviceId')
      .addGroupBy('service.name')
      .orderBy('totalRevenue', 'DESC');

    if (startDate && endDate) {
      queryBuilder.andWhere('trip.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await queryBuilder.getRawMany();
  }
}
