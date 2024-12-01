import { BonusPointLog } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BonusPointLogRepositoryInterface } from '../interface/bonusPointLog.interface';

@Injectable()
export class BonusPointLogRepository extends BaseRepositoryAbstract<BonusPointLog> implements BonusPointLogRepositoryInterface {
  constructor(@InjectRepository(BonusPointLog) private readonly bonusPointLogRepository: Repository<BonusPointLog>) {
    super(bonusPointLogRepository);
  }
}
