import { ClientIp } from '@common/decorators/client-ip.decorator';
import { CurrentUser, CustomersAuthGuard, ICustomer, ValidationPipe } from '@common/index';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards, Version } from '@nestjs/common';
import { CancelTripDto, CreateTripDto, RateTripDto } from './dto';
import { TripsService } from './trips.service';

@UseGuards(CustomersAuthGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly service: TripsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Version('1')
  async create(@Body(ValidationPipe) dto: CreateTripDto, @CurrentUser() { sub }: ICustomer, @ClientIp() ip: string) {
    return this.service.create(dto, sub, ip);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @Version('1')
  async cancel(@Body(ValidationPipe) dto: CancelTripDto, @CurrentUser() { sub }: ICustomer) {
    return this.service.cancel(dto, sub);
  }

  @Post('rate')
  @HttpCode(HttpStatus.OK)
  @Version('1')
  async rate(@Body(ValidationPipe) dto: RateTripDto, @CurrentUser() { sub }: ICustomer) {
    return this.service.rate(dto, sub);
  }

  @Get(':id/payment-status')
  @Version('1')
  async list(@CurrentUser() { sub }: ICustomer, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.getPaymentStatus(sub, id);
  }

  @Get(':id')
  @Version('1')
  async get(@CurrentUser() { sub }: ICustomer, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.show(sub, id);
  }
}
