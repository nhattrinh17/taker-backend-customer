import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards, Version, Get, Query } from '@nestjs/common';
import { CurrentUser, CustomersAuthGuard, ICustomer, ValidationPipe } from '@common/index';

import { ProfileService } from './profile.service';
import { FcmTokenDto, UpdateProfileDto, ReferralDto } from './dto/profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @UseGuards(CustomersAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Get()
  get(@CurrentUser() { sub }: ICustomer) {
    return this.service.getProfile(sub);
  }

  @UseGuards(CustomersAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Post('set-fcm-token')
  setFcmToken(@CurrentUser() { sub }: ICustomer, @Body(ValidationPipe) dto: FcmTokenDto) {
    return this.service.setFcmToken(sub, dto);
  }

  @UseGuards(CustomersAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Get('get-signed-url')
  getSignedUrl(@Query('fileName') key: string) {
    return this.service.getSignedFileUrl(key);
  }

  @UseGuards(CustomersAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Get('referral')
  getReferral(@CurrentUser() { sub }: ICustomer, @Query(ValidationPipe) dto: ReferralDto) {
    return this.service.getReferral(sub, dto);
  }

  @UseGuards(CustomersAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) userId: string, @Body(ValidationPipe) dto: UpdateProfileDto) {
    return this.service.update(userId, dto);
  }
}
