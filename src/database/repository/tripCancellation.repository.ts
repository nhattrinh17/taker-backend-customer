import { TripCancellation } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripCancellationRepositoryInterface } from '../interface/tripCancellation.interface';
import { PaginationDto } from '@common/decorators';

@Injectable()
export class TripCancellationRepository extends BaseRepositoryAbstract<TripCancellation> implements TripCancellationRepositoryInterface {
  constructor(@InjectRepository(TripCancellation) private readonly tripCancellationRepository: Repository<TripCancellation>) {
    super(tripCancellationRepository);
  }

  async getTripCannelByConditionAndJoin(condition: object, pagination: PaginationDto): Promise<any> {
    const { page, limit, offset } = pagination;

    const [result, total] = await this.tripCancellationRepository
      .createQueryBuilder(TripCancellation.name)

      .leftJoinAndSelect(`${TripCancellation.name}.shoemaker`, 'shoemaker')
      .leftJoinAndSelect(`${TripCancellation.name}.customer`, 'customer')
      .leftJoinAndSelect(`${TripCancellation.name}.trip`, 'trip')
      .where(condition) // Điều kiện filter
      .select([TripCancellation.name, 'trip', 'shoemaker.fullName', 'shoemaker.phone', 'customer.fullName', 'customer.phone']) // Chọn các trường từ CustomerVoucher và name từ Customer
      .skip(offset) // Số lượng bản ghi cần bỏ qua
      .take(limit) // Số lượng bản ghi giới hạn
      .orderBy(`${TripCancellation.name}.createdAt`, 'DESC')
      .getManyAndCount(); // Trả về danh sách

    return {
      data: result,

      pagination: {
        ...pagination,
        total: total,
      },
    };
  }

  getDataShoemakerCancel(conditions: object, limit: number): Promise<any> {
    return this.tripCancellationRepository
      .createQueryBuilder('trip_cancellations')
      .leftJoinAndSelect('trip_cancellations.shoemaker', 'shoemaker')
      .select('trip_cancellations.shoemakerId', 'shoemakerId')
      .addSelect('shoemaker.fullName', 'shoemakerName')
      .addSelect('shoemaker.phone', 'shoemakerPhone')
      .addSelect('COUNT(trip_cancellations.id)', 'totalCancel')
      .where(conditions)
      .groupBy('trip_cancellations.shoemakerId')
      .orderBy('totalCancel', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
