import { PaginationDto } from '@common/decorators';
import { CustomerVoucher } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface CustomerVoucherAdminRepositoryInterface extends BaseRepositoryInterface<CustomerVoucher> {
  insertManyVoucherForCustomer(dto: { customerId: string; voucherId: string }[]): Promise<any>;
  revokeAllVoucherById(voucherId: string): Promise<any>;
  findAllAndJoin(condition: object, pagination: PaginationDto): Promise<any>;
}
