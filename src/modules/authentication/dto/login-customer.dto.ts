import { IsString } from 'class-validator';
import { IsPhoneInVn } from '@common/index';
import { DeviceInfoDto } from './create-customer.dto';

export class LoginCustomerDto extends DeviceInfoDto {
  @IsPhoneInVn({ message: 'Invalid phone number' })
  @IsString()
  phone: string;

  @IsString()
  password: string;
}
