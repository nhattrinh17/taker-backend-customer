import { Transform, Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class FcmTokenDto {
  @IsString()
  fcmToken: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  bankName: string;

  @IsOptional()
  @IsString()
  bankAccountNumber: string;

  @IsOptional()
  @IsString()
  bankAccountName: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  platform: string;
}

export class ReferralDto {
  @IsInt()
  @Transform(({ value }) => Number(value))
  take: number;

  @IsInt()
  @Type(() => Number)
  skip: number;
}
