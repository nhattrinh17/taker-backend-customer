import { IsUUID, IsString } from 'class-validator';

export class CancelTripDto {
  @IsUUID()
  tripId: string;

  @IsString()
  reason: string;
}
