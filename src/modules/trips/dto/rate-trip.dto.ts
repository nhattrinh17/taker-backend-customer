import { Type } from 'class-transformer';
import { IsUUID, IsString, IsOptional, IsEnum } from 'class-validator';

export class RateTripDto {
  @IsUUID()
  tripId: string;

  @IsUUID()
  shoemakerId: string;

  @IsOptional()
  @IsString()
  comment: string;

  @IsEnum([1, 2, 3, 4, 5])
  @Type(() => Number)
  rating: number;
}
