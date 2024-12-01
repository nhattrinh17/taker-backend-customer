import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

import { Location, QUEUE_NAMES } from '@common/index';

@Injectable()
export class LeaveRoomListener {
  private readonly logger = new Logger(LeaveRoomListener.name);
  constructor(@InjectQueue(QUEUE_NAMES.LEAVE_ROOM) private queue: Queue) {}

  @OnEvent('leave-room')
  async handleLeaveRoomListener(data: Location & { userId: string }) {
    try {
      this.queue.add('leave-room', data, {
        removeOnComplete: true,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
