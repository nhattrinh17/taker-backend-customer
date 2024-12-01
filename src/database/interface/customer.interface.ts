import { PaginationDto } from '@common/decorators';
import { Customer } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface CustomerRepositoryInterface extends BaseRepositoryInterface<Customer> {
  getIdAllCustomer(): Promise<Customer[]>;

  findAllWithDataOrder(totalOrder: number, minPrice: number, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any>;

  findCustomersLongTimeNoOrder(days: number, pagination: PaginationDto): Promise<any>;

  getUserDownloadStatics(condition: any): Promise<any>;

  findAllCustom(search: string, condition: any, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any>;
}
