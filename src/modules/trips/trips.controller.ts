import { ClientIp } from '@common/decorators/client-ip.decorator';
import { CurrentUser, CustomersAuthGuard, ICustomer, ValidationPipe } from '@common/index';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards, Version } from '@nestjs/common';
import { CancelTripDto, CreateTripDto, RateTripDto } from './dto';
import { TripsService } from './trips.service';
import { SocketCallApiGuard } from '@common/guards/api-public.guard';
import { FindShoemakerWithSocketDto } from './dto/request-trip.dto';

@Controller('trips')
export class TripsController {
  constructor(private readonly service: TripsService) {}

  @Post()
  @UseGuards(CustomersAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Version('1')
  async create(@Body(ValidationPipe) dto: CreateTripDto, @CurrentUser() { sub }: ICustomer, @ClientIp() ip: string) {
    return this.service.create(dto, sub, ip);
  }

  @Post('cancel')
  @UseGuards(CustomersAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Version('1')
  async cancel(@Body(ValidationPipe) dto: CancelTripDto, @CurrentUser() { sub }: ICustomer) {
    return this.service.cancel(dto, sub);
  }

  @Post('rate')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CustomersAuthGuard)
  async rate(@Body(ValidationPipe) dto: RateTripDto, @CurrentUser() { sub }: ICustomer) {
    return this.service.rate(dto, sub);
  }

  @Get(':id/payment-status')
  @Version('1')
  @UseGuards(CustomersAuthGuard)
  async list(@CurrentUser() { sub }: ICustomer, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.getPaymentStatus(sub, id);
  }

  @Get(':id')
  @Version('1')
  @UseGuards(CustomersAuthGuard)
  async get(@CurrentUser() { sub }: ICustomer, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.show(sub, id);
  }

  @Post('find-shoemakers')
  @Version('1')
  @UseGuards(SocketCallApiGuard)
  async findShoemakers(@Body(ValidationPipe) dto: FindShoemakerWithSocketDto) {
    return this.service.findShoemakersBySocket(dto);
  }
}
