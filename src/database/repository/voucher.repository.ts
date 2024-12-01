import { Voucher } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { VoucherAdminRepositoryInterface } from '../interface/voucher.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class VoucherAdminRepository extends BaseRepositoryAbstract<Voucher> implements VoucherAdminRepositoryInterface {
  constructor(@InjectRepository(Voucher) private readonly voucherRepository: Repository<Voucher>) {
    super(voucherRepository); // Truyền repository vào abstract class
  }
}
