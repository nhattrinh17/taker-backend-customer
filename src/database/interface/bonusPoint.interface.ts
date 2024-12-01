import { PaginationDto } from '@common/decorators';
import { BonusPoint } from '@entities/index';
import { BaseRepositoryInterface } from 'src/base';

export interface BonusPointRepositoryInterface extends BaseRepositoryInterface<BonusPoint> {
  callProcedureUpdatePoint(dto: { bonusPointId: string; type: number; point: number; description: string }): Promise<any>;

  findAllSearchAndJoin(search: string, type: string, pagination: PaginationDto): Promise<any>;
}
