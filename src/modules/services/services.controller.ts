import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards, Version } from '@nestjs/common';
import { CustomersAuthGuard, ValidationPipe } from '@common/index';
import { ServicesService } from './services.service';
import { ListServicesDto } from './dto';

@UseGuards(CustomersAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Version('1')
  @Get('')
  @HttpCode(HttpStatus.OK)
  index(@Query(ValidationPipe) dto: ListServicesDto) {
    return this.service.index(dto);
  }
}
