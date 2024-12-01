import { Service } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { ServiceRepositoryInterface } from '../interface/service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class ServiceRepository extends BaseRepositoryAbstract<Service> implements ServiceRepositoryInterface {
  constructor(@InjectRepository(Service) private readonly serviceRepository: Repository<Service>) {
    super(serviceRepository); // Truyền repository vào abstract class
  }
}
