import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { In, Repository } from 'typeorm';

import { QUEUE_NAMES, StatusEnum } from '@common/index';

import { Trip } from '@entities/index';
import { BullQueueService } from '@modules/bullQueue/bullQueue.service';
import { SocketService } from '@modules/socket/socket.service';

@Processor(QUEUE_NAMES.LEAVE_ROOM)
export class BullQueueLeaveRoomConsumer {
  private readonly logger = new Logger(BullQueueLeaveRoomConsumer.name);

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly bullQueueService: BullQueueService,
    private readonly socketService: SocketService,
  ) {}

  @Process('leave-room-backend')
  async handleLeaveRoom(job: Job<unknown>) {
    try {
      const { userId } = job.data as {
        userId: string;
      };

      const trip = await this.tripRepository.findOne({
        where: {
          customerId: userId,
          status: In([StatusEnum.ACCEPTED, StatusEnum.INPROGRESS, StatusEnum.MEETING]),
        },
      });
      if (trip && trip.shoemakerId) {
        const socketCustomerId = await this.socketService.getSocketIdByUserId(userId);
        if (socketCustomerId)
          this.bullQueueService.addQueueLeaveRoom('leave-room-websocket', {
            roomName: trip.shoemakerId,
            socketId: socketCustomerId,
          });
      }
    } catch (error) {
      this.logger.error(error);
      // TODO: Add error handling to sentry
    }
  }
}
