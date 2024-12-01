import { Shoemaker } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ShoemakerRepositoryInterface } from '../interface/Shoemaker.interface';
import { PaginationDto } from '@common/decorators';
import { StatusEnum } from '@common/enums';

@Injectable()
export class ShoemakerRepository extends BaseRepositoryAbstract<Shoemaker> implements ShoemakerRepositoryInterface {
  constructor(
    @InjectRepository(Shoemaker)
    private readonly shoemakerRepository: Repository<Shoemaker>,
  ) {
    super(shoemakerRepository);
  }

  async findShoemakerLongTimeNoActive(days: number, pagination: PaginationDto) {
    const { limit, offset } = pagination;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const queryBuilder = this.shoemakerRepository
      .createQueryBuilder('shoemaker')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('trip.shoemakerId')
          .from('Trip', 'trip')
          .where('trip.status = :completedStatus', { completedStatus: StatusEnum.COMPLETED })
          .groupBy('trip.shoemakerId')
          .having('MAX(trip.date) >= :dateThreshold', { dateThreshold }) // So sánh với ngày gần nhất đặt đơn thành công
          .getQuery();

        return `shoemaker.id NOT IN ${subQuery}`;
      })
      .select(['shoemaker.id', 'shoemaker.phone', 'shoemaker.fullName', 'shoemaker.registrationDate', 'shoemaker.lastLoginDate'])
      .skip(offset)
      .take(limit);

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      data: result,
      pagination: {
        ...pagination,
        total,
      },
    };
  }

  async findAllCustom(search: string, referralCode: string, status: string, isVerified: number, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any> {
    const { limit, offset } = pagination;

    const condition = {};
    if (referralCode) condition['referralCode'] = Like(`%${referralCode?.trim()}%`);
    if (status) condition['status'] = status;
    if (isVerified != undefined) condition['isVerified'] = Boolean(isVerified);

    const queryBuilder = this.shoemakerRepository
      .createQueryBuilder('shoemaker')
      .leftJoinAndSelect('shoemaker.wallet', 'wallet') // Giả sử bạn có liên kết từ shoemaker sang Wallet
      .where(condition);

    if (search) {
      queryBuilder.andWhere('(shoemaker.fullName LIKE :keyword OR shoemaker.phone LIKE :keyword)', {
        keyword: `%${search}%`,
      });
    }

    queryBuilder.skip(offset).take(limit);

    if (sort) {
      queryBuilder.orderBy(`shoemaker.${sort || 'createdAt'}`, typeSort || 'DESC');
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      pagination: {
        ...pagination,
        total,
      },
    };
  }

  async findAllExport(condition: any, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any> {
    const { limit, offset } = pagination;

    const queryBuilder = this.shoemakerRepository
      .createQueryBuilder('shoemaker')
      .leftJoinAndSelect('shoemaker.wallet', 'wallet') // Liên kết với wallet
      .where(condition)

      .skip(offset)
      .take(limit);

    if (sort) {
      queryBuilder.orderBy(`shoemaker.${sort}`, typeSort || 'DESC');
    } else {
      queryBuilder.orderBy('shoemaker.registrationDate', 'DESC');
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      pagination: {
        ...pagination,
        total,
      },
    };
  }

  async getUserDownloadStatics(condition: any): Promise<any> {
    return this.repository
      .createQueryBuilder(Shoemaker.name)
      .where(condition)
      .select([
        `COUNT(*) AS userCount`,
        `COUNT(CASE WHEN ${Shoemaker.name}.referralCode IS NOT NULL THEN 1 END) AS referralCount`,
        `COUNT(CASE WHEN ${Shoemaker.name}.referralCode IS NULL THEN 0 END) AS noCodeCount`,
        `COUNT(CASE WHEN ${Shoemaker.name}.platform = 'ios' THEN 1 END) AS iosCount`,
        `COUNT(CASE WHEN ${Shoemaker.name}.platform = 'android' THEN 1 END) AS androidCount`,
        `COUNT(CASE WHEN ${Shoemaker.name}.platform = 'unknown' THEN 1 END) AS unknownDeviceCount`,
        `COUNT(CASE WHEN ${Shoemaker.name}.isVerified = true THEN 1 END) AS verifiedCount`,
        `COUNT(CASE WHEN ${Shoemaker.name}.isVerified = false THEN 0 END) AS unverifiedCount`,
        `COUNT(CASE WHEN ${Shoemaker.name}.serviceShoe = true THEN 1 END) AS serviceShoeCount`,
        `COUNT(CASE WHEN ${Shoemaker.name}.serviceBike = true THEN 1 END) AS serviceBikeCount`,
        `COUNT(CASE WHEN ${Shoemaker.name}.serviceFood = true THEN 1 END) AS serviceFoodCount`,
      ])
      .getRawOne();
  }
}
