import { PaginationDto } from '@common/decorators';
import { Shoemaker } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface ShoemakerRepositoryInterface extends BaseRepositoryInterface<Shoemaker> {
  findShoemakerLongTimeNoActive(days: number, pagination: PaginationDto): Promise<any>;

  findAllCustom(search: string, referralCode: string, status: string, isVerified: number, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any>;

  findAllExport(condition: any, pagination: PaginationDto, sort: string, typeSort: 'ASC' | 'DESC'): Promise<any>;

  getUserDownloadStatics(condition: any): Promise<any>;
}
