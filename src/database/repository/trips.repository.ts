import { Trip } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripRepositoryInterface } from '../interface/trip.interface';
import { PaginationDto } from '@common/decorators';
import { StatusEnum } from '@common/enums';

@Injectable()
export class TripRepository extends BaseRepositoryAbstract<Trip> implements TripRepositoryInterface {
  constructor(@InjectRepository(Trip) private readonly tripRepository: Repository<Trip>) {
    super(tripRepository);
  }

  async getTripByConditionAndJoin(condition: object, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any> {
    const { page, limit, offset } = pagination;

    const [result, total] = await this.tripRepository
      .createQueryBuilder(Trip.name)
      .leftJoinAndSelect(`${Trip.name}.customer`, 'customer')
      .leftJoinAndSelect(`${Trip.name}.shoemaker`, 'shoemaker')
      .where(condition) // Điều kiện filter
      .select([Trip.name, 'customer.fullName', 'shoemaker.fullName', 'customer.phone', 'shoemaker.phone']) // Chọn các trường từ CustomerVoucher và name từ Customer
      .skip(offset) // Số lượng bản ghi cần bỏ qua
      .take(limit) // Số lượng bản ghi giới hạn
      .orderBy(`${Trip.name}.${sort || 'date'}`, typeSort || 'DESC')
      .getManyAndCount(); // Trả về danh sách

    return {
      data: result,

      pagination: {
        ...pagination,
        total: total,
      },
    };
  }

  getTotalOrderAndSpentByCustomers(customerIds: string[]): Promise<any[]> {
    return this.tripRepository
      .createQueryBuilder(Trip.name)
      .select(`${Trip.name}.customerId`, `customerId`)
      .addSelect(`SUM(${Trip.name}.totalPrice)`, `totalSpent`)
      .addSelect(`COUNT(${Trip.name}.id)`, `totalOrders`)
      .where(`${Trip.name}.customerId IN (:...customerIds)`, { customerIds })
      .andWhere(`${Trip.name}.status = :completedStatus`, { completedStatus: StatusEnum.COMPLETED })
      .groupBy(`${Trip.name}.customerId`)
      .getRawMany();
  }

  getTotalOrderAndSpentByShoemaker(shoemakerIds: string[]): Promise<any[]> {
    return this.tripRepository
      .createQueryBuilder(Trip.name)
      .select(`${Trip.name}.shoemakerId`, `shoemakerId`)
      .addSelect(`SUM(${Trip.name}.income)`, `totalIncome`)
      .addSelect(`COUNT(${Trip.name}.id)`, `totalOrders`)
      .where(`${Trip.name}.shoemakerId IN (:...shoemakerIds)`, { shoemakerIds })
      .andWhere(`${Trip.name}.status = :completedStatus`, { completedStatus: StatusEnum.COMPLETED })
      .groupBy(`${Trip.name}.shoemakerId`)
      .getRawMany();
  }

  async getShoemakerTopIncome(conditions: object, limit: number): Promise<any> {
    return this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.shoemaker', 'shoemaker')
      .select('trip.shoemakerId', 'shoemakerId')
      .addSelect('shoemaker.fullName', 'shoemakerName')
      .addSelect('shoemaker.phone', 'shoemakerPhone')
      .addSelect('SUM(trip.income)', 'totalIncome')
      .addSelect('COUNT(trip.id)', 'totalOrders')
      .where(conditions)
      .groupBy('trip.shoemakerId')
      .orderBy('totalIncome', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  getShoemakerTopActivity(conditions: object, limit: number): Promise<any> {
    return this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.shoemaker', 'shoemaker')
      .select('trip.shoemakerId', 'shoemakerId')
      .addSelect('shoemaker.fullName', 'shoemakerName')
      .addSelect('shoemaker.phone', 'shoemakerPhone')
      .addSelect('COUNT(trip.id)', 'totalReceiver')
      .addSelect(`SUM(CASE WHEN trip.status = '${StatusEnum.COMPLETED}' THEN 1 ELSE 0 END)`, 'totalCompleted')
      .where(conditions)
      .groupBy('trip.shoemakerId')
      .orderBy('totalReceiver', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  getTripByIdAndJoin(id: string): Promise<Trip> {
    return this.tripRepository
      .createQueryBuilder()
      .leftJoinAndSelect(`${Trip.name}.customer`, 'customer')
      .leftJoinAndSelect(`${Trip.name}.shoemaker`, 'shoemaker')
      .where(`${Trip.name}.id = :id`, { id })
      .select([`${Trip.name}.id`, `${Trip.name}.address`, `${Trip.name}.totalPrice`, `${Trip.name}.date`, `${Trip.name}.paymentMethod`, `${Trip.name}.status`, `customer.fullName`, `customer.phone`, `shoemaker.fullName`, `shoemaker.phone`])
      .getOne();
  }
}
