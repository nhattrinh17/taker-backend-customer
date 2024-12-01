import { PaginationDto } from '@common/decorators';
import { Wallet } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface WalletRepositoryInterface extends BaseRepositoryInterface<Wallet> {
  callProcedureUpdateWallet(dto: { walletId: string; type: number; amount: number; description: string }): Promise<any>;

  findAllAndJoin(type: 'customer' | 'shoemaker', search: string, pagination: PaginationDto): Promise<any>;
}
