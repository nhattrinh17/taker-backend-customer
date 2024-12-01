import { SystemNotification } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { BaseRepositoryAbstract } from 'src/base';
import { SystemNotificationRepositoryInterface } from '../interface/systemNotification.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class SystemNotificationRepository extends BaseRepositoryAbstract<SystemNotification> implements SystemNotificationRepositoryInterface {
  constructor(@InjectRepository(SystemNotification) private readonly SystemNotificationRepository: Repository<SystemNotification>) {
    super(SystemNotificationRepository); // Truyền repository vào abstract class
  }
}
