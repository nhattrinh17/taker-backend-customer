import { IsString } from 'class-validator';

export class DataShoemakerResponseTripDto {
  tripId: string;
  jobId: string;
  time: string;
  distance: string;
  scheduleTime: number;
  customerId: string;
  shoemakerId: string;
  orderId: string;
}

export class FindShoemakerWithSocketDto {
  @IsString()
  userId: string;

  @IsString()
  tripId: string;
}
