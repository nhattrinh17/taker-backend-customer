import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Service } from '@entities/index';
import { ListServicesDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(@InjectRepository(Service) private readonly serviceRep: Repository<Service>) {}

  /**
   * Function to retrieve a list of services
   * @param listServicesDto ListServicesDto
   * @returns Promise<Service[]>
   */
  index({ take, skip }: ListServicesDto): Promise<Service[]> {
    try {
      return this.serviceRep.find({
        select: ['name', 'price', 'discountPrice', 'discount', 'id', 'icon', 'experienceOnce'],
        take,
        skip,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
