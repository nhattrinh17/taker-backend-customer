import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

import { QUEUE_NAMES } from '@common/index';

@Injectable()
export class JoinRoomListener {
  private readonly logger = new Logger(JoinRoomListener.name);
  constructor(@InjectQueue(QUEUE_NAMES.JOIN_ROOM) private queue: Queue) {}

  @OnEvent('join-room')
  async handleJoinRoomListener(data: { userId: string }) {
    try {
      this.queue.add('join-room', data, {
        removeOnComplete: true,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
