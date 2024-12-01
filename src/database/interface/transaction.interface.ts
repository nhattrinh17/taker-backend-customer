import { PaginationDto } from '@common/decorators';
import { Transaction } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface TransactionRepositoryInterface extends BaseRepositoryInterface<Transaction> {
  findAllWidthDraw(typeSearch: string, search: string, condition: object, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any>;
  findAllWidthDrawExport(condition: object, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any>;
}
