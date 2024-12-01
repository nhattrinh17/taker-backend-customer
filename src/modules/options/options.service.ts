import { Inject, Injectable } from '@nestjs/common';
import { OptionRepositoryInterface } from 'src/database/interface/option.interface';

@Injectable()
export class OptionsService {
  constructor(
    @Inject('OptionRepositoryInterface')
    private readonly optionRepository: OptionRepositoryInterface,
  ) {}

  findOne(key: string) {
    return this.optionRepository.findOneByCondition({
      key: key,
    });
  }
}
