import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { IsPhoneInVn } from '@common/index';
import { Transform } from 'class-transformer';

export class ForgotCustomerDto {
  @IsPhoneInVn({ message: 'Invalid phone number' })
  @IsString()
  phone: string;
}
