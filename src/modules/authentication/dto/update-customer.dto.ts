import { IsOptional, IsString, IsEmail } from 'class-validator';

export class NewPasswordDto {
  @IsString()
  otp: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  referralCode: string;

  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsEmail()
  email: string;
}
