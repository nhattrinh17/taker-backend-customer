import { IsArrayOfInstancesOf, PaymentEnum } from '@common/index';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

/**
 * TODO: Add more feature in the feature
 * Create trip DTO
 */

class Service {
  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discountPrice: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discount: number;

  @IsUUID()
  serviceId: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;
}
export class CreateTripDto {
  @IsUUID()
  customerId: string;

  @IsString()
  latitude: string;

  @IsString()
  longitude: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsEnum(PaymentEnum)
  paymentMethod: PaymentEnum;

  @IsOptional()
  @IsArray()
  images: string[];

  @IsArray()
  @IsArrayOfInstancesOf(Service)
  @ArrayMinSize(1)
  @Type(() => Service)
  services: Service[];

  @IsOptional()
  @IsString()
  addressNote: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  scheduleTime: number;
}
