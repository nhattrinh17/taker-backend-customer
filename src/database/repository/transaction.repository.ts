import { Transaction } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { TransactionRepositoryInterface } from '../interface/transaction.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '@common/decorators';
@Injectable()
export class TransactionRepository extends BaseRepositoryAbstract<Transaction> implements TransactionRepositoryInterface {
  constructor(@InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>) {
    super(transactionRepository); // Truyền repository vào abstract class
  }

  async findAllWidthDraw(typeSearch: string, search: string, condition: object, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any> {
    const query = this.transactionRepository
      //
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.wallet', 'wallet')
      .leftJoinAndSelect('wallet.customer', 'customer')
      .leftJoinAndSelect('wallet.shoemaker', 'shoemaker')
      .where(condition);
    if (search) {
      query.andWhere('(customer.fullName LIKE :search OR customer.phone LIKE :search OR shoemaker.fullName LIKE :search OR shoemaker.phone LIKE :search)', {
        search: `%${search}%`,
      });
    }

    // Kiểm tra `typeSearch` và chỉ lấy bản ghi của `customer` khi `typeSearch` là "customer"
    if (typeSearch === 'customer') {
      query.andWhere('wallet.customer IS NOT NULL'); // Chỉ lấy các bản ghi có liên kết với customer
    } else if (typeSearch === 'shoemaker') {
      query.andWhere('wallet.shoemaker IS NOT NULL'); // Chỉ lấy các bản ghi có liên kết với shoemaker
    }

    query.take(pagination.limit).skip(pagination.offset).select([
      'transaction.id',
      'transaction.status',
      'transaction.amount',
      'transaction.transactionDate',
      'transaction.evidence',
      'wallet.id', // chọn ID của wallet để tham chiếu
      'customer.id', // ID của customer để liên kết
      'customer.fullName',
      'customer.phone',
      'customer.bankAccountNumber',
      'customer.bankName',
      'customer.referralCode',
      'shoemaker.id', // ID của shoemaker để liên kết
      'shoemaker.fullName',
      'shoemaker.phone',
      'shoemaker.accountNumber',
      'shoemaker.bankName',
      'shoemaker.referralCode',
    ]);
    if (sort) {
      query.orderBy(`transaction.${sort}`, typeSort || 'DESC');
    } else {
      query.orderBy('transaction.transactionDate', 'DESC');
    }

    const [result, total] = await query.getManyAndCount();

    return {
      data: result,
      pagination: {
        ...pagination,
        total,
      },
    };
  }

  async findAllWidthDrawExport(condition: object, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any> {
    const query = this.transactionRepository
      //
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.wallet', 'wallet')
      .leftJoinAndSelect('wallet.customer', 'customer')
      .leftJoinAndSelect('wallet.shoemaker', 'shoemaker')
      .where(condition);

    query
      .take(pagination.limit)
      .skip(pagination.offset)
      .select([
        'transaction.id',
        'transaction.status',
        'transaction.amount',
        'transaction.transactionDate',
        'transaction.evidence',
        'transaction.description',
        'wallet.id',
        'wallet.balance',
        'customer.id',
        'customer.fullName',
        'customer.phone',
        'customer.bankAccountNumber',
        'customer.bankAccountName',
        'customer.bankName',
        'shoemaker.id',
        'shoemaker.fullName',
        'shoemaker.phone',
        'shoemaker.accountNumber',
        'shoemaker.accountName',
        'shoemaker.bankName',
      ]);
    if (sort) {
      query.orderBy(`transaction.${sort}`, typeSort || 'DESC');
    } else {
      query.orderBy('transaction.transactionDate', 'DESC');
    }

    const [result, total] = await query.getManyAndCount();

    return {
      data: result,
      pagination: {
        ...pagination,
        total,
      },
    };
  }
}
