import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards, Version } from '@nestjs/common';
import { CurrentUser, CustomersAuthGuard, ICustomer, ValidationPipe } from '@common/index';

import { ActivitiesService } from './activities.service';
import { ActivityDto } from './dto/activity.dto';

@UseGuards(CustomersAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Get('in-progress')
  inProgress(@CurrentUser() { sub }: ICustomer) {
    return this.service.inProgress(sub);
  }

  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Get('histories')
  histories(@CurrentUser() { sub }: ICustomer, @Query(ValidationPipe) dto: ActivityDto) {
    return this.service.histories(sub, dto);
  }
}
