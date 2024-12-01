import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { IsPhoneInVn } from '@common/index';
import { Transform } from 'class-transformer';
export class DeviceInfoDto {
  @IsOptional()
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsString()
  deviceId2: string;

  @IsOptional()
  @IsString()
  manufacturer: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  memory: number;

  @IsOptional()
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  systemName: string;

  @IsOptional()
  @IsString()
  deviceType: string;
}

export class CreateCustomerDto extends DeviceInfoDto {
  @IsPhoneInVn({ message: 'Invalid phone number' })
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsOptional()
  @IsString()
  referralCode: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  platform: string;
}

export class VerifyPhoneNumberDto {
  @IsString()
  @IsPhoneInVn({ message: 'Invalid phone number' })
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  otp: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsNumber()
  @Transform((value) => Number(value.value))
  isForgetPass: number;
}
