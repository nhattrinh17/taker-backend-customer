import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';

import { QUEUE_NAMES, RequestTripData } from '@common/index';
import { Trip } from '@entities/index';

@Injectable()
export class RequestTripListener {
  private readonly logger = new Logger(RequestTripListener.name);
  constructor(
    @InjectQueue(QUEUE_NAMES.CUSTOMERS_TRIP) private queue: Queue,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  @OnEvent('find-closest-shoemakers')
  async handleFindClosestShoemakersListener(
    data: RequestTripData & { userId: string },
  ) {
    try {
      // Create promise delay 1 seconds
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
      await delay(1000);
      // Find closest shoemakers
      const trip = await this.tripRepository.findOneBy({ id: data.tripId });
      if (!trip?.jobId) {
        const job = await this.queue.add('find-closest-shoemakers', data, {
          removeOnComplete: true,
        });
        await this.tripRepository.update(trip.id, { jobId: job.id as string });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
