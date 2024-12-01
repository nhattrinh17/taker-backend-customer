import { CustomerVoucher } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CustomerVoucherAdminRepositoryInterface } from '../interface/customerVoucher.interface';
import { PaginationDto } from '@common/decorators';

@Injectable()
export class CustomerVoucherAdminRepository extends BaseRepositoryAbstract<CustomerVoucher> implements CustomerVoucherAdminRepositoryInterface {
  constructor(@InjectRepository(CustomerVoucher) private readonly customerVoucherRepository: Repository<CustomerVoucher>) {
    super(customerVoucherRepository); // Truyền repository vào abstract class
  }

  insertManyVoucherForCustomer(dto: { customerId: string; voucherId: string }[]): Promise<any> {
    return this.customerVoucherRepository.insert(dto);
  }

  revokeAllVoucherById(voucherId: string): Promise<any> {
    // console.log('🚀 ~ CustomerVoucherAdminRepository ~ revokeAllVoucherById ~ voucherId:', voucherId);
    return this.customerVoucherRepository.delete({
      voucherId,
      timeUse: IsNull(), // Revoke voucher
    });
  }

  async findAllAndJoin(condition: object, pagination: PaginationDto): Promise<any> {
    const { page, limit, offset } = pagination;

    const [result, total] = await this.customerVoucherRepository
      .createQueryBuilder(CustomerVoucher.name)
      .leftJoinAndSelect(`${CustomerVoucher.name}.customer`, 'customer') // Join với bảng Customer
      .where(condition) // Điều kiện filter
      .select([CustomerVoucher.name, 'customer.fullName', 'customer.phone']) // Chọn các trường từ CustomerVoucher và name từ Customer
      .skip(offset) // Số lượng bản ghi cần bỏ qua
      .take(limit) // Số lượng bản ghi giới hạn
      .getManyAndCount(); // Trả về danh sách

    return {
      data: result,

      pagination: {
        ...pagination,
        total: total,
      },
    };
  }
}
