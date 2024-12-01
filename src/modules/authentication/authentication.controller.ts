import { CurrentUser, CustomersAuthGuard, ICustomer, ValidationPipe } from '@common/index';
import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards, Version } from '@nestjs/common';

import { AuthenticationService } from './authentication.service';

import { CreateCustomerDto, ForgotCustomerDto, LoginCustomerDto, NewPasswordDto, VerifyOtpDto, VerifyPhoneNumberDto } from './dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private service: AuthenticationService) {}

  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Post('verify-phone-number')
  verifyPhoneNumber(@Body(ValidationPipe) dto: VerifyPhoneNumberDto) {
    return this.service.verifyPhoneNumber(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Version('2')
  @Post('verify-phone-number')
  verifyPhoneNumberV2(@Body(ValidationPipe) dto: VerifyPhoneNumberDto) {
    return this.service.verifyPhoneNumberV2(dto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Version('1')
  @Post()
  createAccount(@Body(ValidationPipe) dto: CreateCustomerDto) {
    return this.service.createAccount(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Post('verify-otp')
  verifyOtp(@Body(ValidationPipe) dto: VerifyOtpDto) {
    return this.service.verifyOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Post('login')
  login(@Body(ValidationPipe) dto: LoginCustomerDto) {
    return this.service.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Post('forgot-password')
  forgotPassword(@Body(ValidationPipe) dto: ForgotCustomerDto) {
    return this.service.forgotPassword(dto);
  }

  @UseGuards(CustomersAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Post('logout')
  logout(@CurrentUser() { sub }: ICustomer) {
    return this.service.logout(sub);
  }

  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Post('make-call')
  call(@Body(ValidationPipe) dto: ForgotCustomerDto) {
    return this.service.makeCallUser(dto.phone);
  }

  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Post('send-sms')
  sendSms(@Body(ValidationPipe) dto: ForgotCustomerDto) {
    return this.service.sendSms(dto.phone);
  }

  @UseGuards(CustomersAuthGuard)
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  destroy(@Param('id', ParseUUIDPipe) userId: string) {
    return this.service.destroy(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Version('1')
  @Post(':id/new-password')
  newPassword(@Param('id', ParseUUIDPipe) userId: string, @Body(ValidationPipe) dto: NewPasswordDto) {
    return this.service.newPassword(userId, dto);
  }
}
