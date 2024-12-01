import { WalletLog } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { WalletLogRepositoryInterface } from '../interface/walletLog.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class WalletLogRepository extends BaseRepositoryAbstract<WalletLog> implements WalletLogRepositoryInterface {
  constructor(@InjectRepository(WalletLog) private readonly walletLogRepository: Repository<WalletLog>) {
    super(walletLogRepository); // Truyền repository vào abstract class
  }
}
