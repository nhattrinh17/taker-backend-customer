import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Location } from '@common/index';
import { BullQueueService } from '@modules/bullQueue/bullQueue.service';

@Injectable()
export class LeaveRoomListener {
  private readonly logger = new Logger(LeaveRoomListener.name);
  constructor(private readonly bullQueueService: BullQueueService) {}

  @OnEvent('leave-room')
  async handleLeaveRoomListener(data: Location & { userId: string }) {
    try {
      this.bullQueueService.addQueueLeaveRoom('leave-room-backend', data, {
        removeOnComplete: true,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
