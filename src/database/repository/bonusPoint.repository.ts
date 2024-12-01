import { BonusPoint } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BonusPointRepositoryInterface } from '../interface/bonusPoint.interface';
import { PaginationDto } from '@common/decorators';

@Injectable()
export class BonusPointRepository extends BaseRepositoryAbstract<BonusPoint> implements BonusPointRepositoryInterface {
  constructor(@InjectRepository(BonusPoint) private readonly bonusPointRepository: Repository<BonusPoint>) {
    super(bonusPointRepository);
  }

  callProcedureUpdatePoint(dto: { bonusPointId: string; type: number; point: number; description: string }): Promise<any> {
    return this.bonusPointRepository.query('CALL update_bonus_point(?, ?, ?, ?);', [dto.bonusPointId, dto.type, dto.point, dto.description]);
  }

  async findAllSearchAndJoin(search: string, type: 'customer' | 'shoemaker', pagination: PaginationDto): Promise<any> {
    const { page, limit } = pagination;
    const queryBuilder = this.bonusPointRepository.createQueryBuilder(BonusPoint.name).leftJoinAndSelect(`${BonusPoint.name}.customer`, 'customer').leftJoinAndSelect(`${BonusPoint.name}.shoemaker`, 'shoemaker');

    // Kiểm tra loại và thêm điều kiện tìm kiếm
    if (type === 'customer') {
      queryBuilder.where('customer.fullName LIKE :search OR customer.phone LIKE :search', { search: `%${search}%` });
    } else if (type === 'shoemaker') {
      queryBuilder.where('shoemaker.fullName LIKE :search OR shoemaker.phone LIKE :search', { search: `%${search}%` });
    }

    queryBuilder
      .select([BonusPoint.name, 'customer.fullName', 'customer.phone', 'shoemaker.fullName', 'shoemaker.phone'])
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
