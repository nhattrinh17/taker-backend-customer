import { Device } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { DeviceRepositoryInterface } from '../interface/device.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class DeviceRepository extends BaseRepositoryAbstract<Device> implements DeviceRepositoryInterface {
  constructor(@InjectRepository(Device) private readonly deviceRepository: Repository<Device>) {
    super(deviceRepository); // Truyền repository vào abstract class
  }
}
