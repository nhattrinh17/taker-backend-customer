import { Customer, Trip } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { CustomerRepositoryInterface } from '../interface/customer.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '@common/decorators';
import { StatusEnum } from '@common/enums';

@Injectable()
export class CustomerRepository extends BaseRepositoryAbstract<Customer> implements CustomerRepositoryInterface {
  constructor(@InjectRepository(Customer) private readonly customerRepository: Repository<Customer>) {
    super(customerRepository);
  }

  async findAllCustom(search: string, condition: any, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any> {
    const { limit, offset } = pagination;

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.wallet', 'wallet') // Giả sử bạn có liên kết từ Customer sang Wallet
      .where(condition);

    if (search) {
      queryBuilder.andWhere('(customer.fullName LIKE :keyword OR customer.phone LIKE :keyword)', {
        keyword: `%${search}%`,
      });
    }

    queryBuilder
      .select([
        'customer.id',
        'customer.phone',
        'customer.fullName',
        'customer.referralCode',
        'customer.registrationDate',
        'customer.lastLoginDate',
        'customer.isVerified',
        'customer.bankName',
        'customer.bankAccountNumber',
        'customer.bankAccountName',
        'customer.address',
        'customer.createdAt',
        'wallet.balance',
        'wallet.id',
      ])
      .orderBy(`customer.${sort || 'createdAt'}`, typeSort || 'DESC')
      .skip(offset)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      pagination: {
        ...pagination,
        total,
      },
    };
  }

  getIdAllCustomer(): Promise<Customer[]> {
    return this.customerRepository.find({
      select: ['id'],
      where: {
        isVerified: true,
      },
    });
  }

  async findCustomersLongTimeNoOrder(days: number, pagination: PaginationDto): Promise<any> {
    const { limit, offset } = pagination;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('trip.customerId')
          .from('Trip', 'trip')
          .where('trip.status = :completedStatus', { completedStatus: StatusEnum.COMPLETED })
          .groupBy('trip.customerId')
          .having('MAX(trip.date) >= :dateThreshold', { dateThreshold }) // So sánh với ngày gần nhất đặt đơn thành công
          .getQuery();

        return `customer.id NOT IN ${subQuery}`;
      })
      .select(['customer.id', 'customer.phone', 'customer.fullName', 'customer.registrationDate', 'customer.lastLoginDate'])
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

  async findAllWithDataOrder(totalOrder: number, minPrice: number, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any> {
    console.log('AAAAAAAAA');
    const { limit, offset } = pagination;

    const queryBuilder = this.customerRepository
      .createQueryBuilder(Customer.name)
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('trip.customerId')
          .from(Trip, 'trip')
          .where('trip.status = :completedStatus', { completedStatus: StatusEnum.COMPLETED })
          .groupBy('trip.customerId')
          .having('COUNT(trip.id) >= :totalOrder', { totalOrder })
          .andHaving('SUM(trip.totalPrice) >= :minPrice', { minPrice })
          .getQuery();

        return `${Customer.name}.id IN ${subQuery}`;
      })
      .leftJoin(
        (qb) =>
          qb
            .subQuery()
            .select('trip.customerId', 'customerId')
            .addSelect('COUNT(trip.id)', 'totalOrders')
            .addSelect('SUM(trip.totalPrice)', 'totalSpent')
            .from(Trip, 'trip')
            .where('trip.status = :completedStatus', { completedStatus: StatusEnum.COMPLETED })
            .groupBy('trip.customerId'),
        'tripSummary',
        `tripSummary.customerId = ${Customer.name}.id`,
      )
      .select(['tripSummary.totalOrders', 'tripSummary.totalSpent', `${Customer.name}.id`, `${Customer.name}.phone`, `${Customer.name}.fullName`, `${Customer.name}.referralCode`, `${Customer.name}.registrationDate`, `${Customer.name}.lastLoginDate`])
      .skip(offset)
      .take(limit)
      .orderBy(`${Customer.name}.${sort || 'registrationDate'}`, typeSort || 'DESC');

    console.log(queryBuilder.getSql()); // Log truy vấn SQL

    const total = await queryBuilder.getCount();
    const rawData = await queryBuilder.getRawMany();

    const data = rawData.map((row) => {
      return {
        id: row.Customer_id,
        phone: row.Customer_phone,
        fullName: row.Customer_fullName,
        referralCode: row.Customer_referralCode,
        registrationDate: row.Customer_registrationDate,
        lastLoginDate: row.Customer_lastLoginDate,
        totalOrders: Number(row.totalOrders || 0),
        totalSpent: Number(row.totalSpent || 0),
      };
    });

    return {
      data,
      pagination: {
        ...pagination,
        // total,
      },
    };
  }

  async getUserDownloadStatics(condition: string): Promise<any> {
    return this.repository
      .createQueryBuilder(Customer.name)
      .where(condition)
      .select([
        `COUNT(*) AS userCount`,
        `COUNT(CASE WHEN ${Customer.name}.referralCode IS NOT NULL THEN 1 END) AS referralCount`,
        `COUNT(CASE WHEN ${Customer.name}.referralCode IS NULL THEN 0 END) AS noCodeCount`,
        `COUNT(CASE WHEN ${Customer.name}.platform = 'ios' THEN 1 END) AS iosCount`,
        `COUNT(CASE WHEN ${Customer.name}.platform = 'android' THEN 1 END) AS androidCount`,
        `COUNT(CASE WHEN ${Customer.name}.platform = 'unknown' THEN 1 END) AS unknownDeviceCount`,
        `COUNT(CASE WHEN ${Customer.name}.isVerified = true THEN 1 END) AS verifiedCount`,
        `COUNT(CASE WHEN ${Customer.name}.isVerified = false THEN 1 END) AS unverifiedCount`,
        `COUNT(CASE WHEN ${Customer.name}.newUser = true THEN 1 END) AS usedServicesCount`,
        `COUNT(CASE WHEN ${Customer.name}.newUser = false THEN 1 END) AS unUsedServicesCount`,
      ])
      .getRawOne();
  }
}
