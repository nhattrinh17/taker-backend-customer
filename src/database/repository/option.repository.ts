import { Option } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { OptionRepositoryInterface } from '../interface/option.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class OptionRepository extends BaseRepositoryAbstract<Option> implements OptionRepositoryInterface {
  constructor(@InjectRepository(Option) private readonly OptionRepository: Repository<Option>) {
    super(OptionRepository); // Truyền repository vào abstract class
  }
}
