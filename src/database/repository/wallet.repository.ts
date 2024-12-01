import { Wallet } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { WalletRepositoryInterface } from '../interface/wallet.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '@common/decorators';
@Injectable()
export class WalletRepository extends BaseRepositoryAbstract<Wallet> implements WalletRepositoryInterface {
  constructor(@InjectRepository(Wallet) private readonly walletRepository: Repository<Wallet>) {
    super(walletRepository); // Truyền repository vào abstract class
  }

  callProcedureUpdateWallet(dto: { walletId: string; type: number; amount: number; description: string }): Promise<any> {
    return this.walletRepository.query('CALL update_wallet_taker(?, ?, ?, ?);', [dto.walletId, dto.type, dto.amount, dto.description]);
  }

  async findAllAndJoin(type: 'customer' | 'shoemaker', search: string, pagination: PaginationDto): Promise<any> {
    const { page, limit } = pagination;
    const queryBuilder = this.walletRepository.createQueryBuilder(Wallet.name).leftJoinAndSelect(`${Wallet.name}.customer`, 'customer').leftJoinAndSelect(`${Wallet.name}.shoemaker`, 'shoemaker');

    // Kiểm tra loại và thêm điều kiện tìm kiếm
    if (type === 'customer') {
      queryBuilder.where('customer.fullName LIKE :search OR customer.phone LIKE :search', { search: `%${search}%` });
    } else if (type === 'shoemaker') {
      queryBuilder.where('shoemaker.fullName LIKE :search OR shoemaker.phone LIKE :search', { search: `%${search}%` });
    }

    queryBuilder
      .select([Wallet.name, 'customer.fullName', 'customer.phone', 'shoemaker.fullName', 'shoemaker.phone'])
      .skip((page - 1) * limit)
      .take(limit);
    // Thực hiện truy vấn và trả về kết quả
    const [result, total] = await queryBuilder.getManyAndCount(); // getManyAndCount sẽ trả về [dữ liệu, tổng số bản ghi]
    return {
      data: result,

      pagination: {
        ...pagination,
        total: total,
      },
    };
  }
}
