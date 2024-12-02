import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BullQueueService } from '@modules/bullQueue/bullQueue.service';

@Injectable()
export class JoinRoomListener {
  private readonly logger = new Logger(JoinRoomListener.name);
  constructor(private readonly bullQueueService: BullQueueService) {}

  @OnEvent('join-room')
  async handleJoinRoomListener(data: { userId: string }) {
    try {
      this.bullQueueService.addQueueJoinRoom('join-room-backend', data, {
        removeOnComplete: true,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
