import { PointToProduct } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointToProductRepositoryInterface } from '../interface/pointToProduct.interface';

@Injectable()
export class PointToProductRepository extends BaseRepositoryAbstract<PointToProduct> implements PointToProductRepositoryInterface {
  constructor(@InjectRepository(PointToProduct) private readonly pointToProductRepository: Repository<PointToProduct>) {
    super(pointToProductRepository);
  }
}
