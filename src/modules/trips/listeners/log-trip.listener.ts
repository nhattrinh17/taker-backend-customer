import { TripLog } from '@entities/index';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TripLogListener {
  private readonly logger = new Logger(TripLogListener.name);
  constructor(
    @InjectRepository(TripLog)
    private readonly tripLogRepository: Repository<TripLog>,
  ) {}

  @OnEvent('update-trip-log')
  async handleFindClosestShoemakersListener(data: {
    tripId: string;
    type: string;
    data: string;
  }) {
    try {
      this.tripLogRepository.save(data).catch((error) => {
        this.logger.error(error);
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
