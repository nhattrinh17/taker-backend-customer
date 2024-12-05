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
  userId: string;
  tripId: string;
  location: { lat: number; lng: number };
  statusSchedule?: string;
}
