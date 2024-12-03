import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { In, Repository } from 'typeorm';

import { QUEUE_NAMES, StatusEnum } from '@common/index';

import { Trip } from '@entities/index';
import { BullQueueService } from '@modules/bullQueue/bullQueue.service';
import { SocketService } from '@modules/socket/socket.service';
import { QueueStartJointRoomDto } from './dto/bullQueue.dto';

@Processor(QUEUE_NAMES.JOIN_ROOM)
export class BullQueueJoinRoomConsumer {
  private readonly logger = new Logger(BullQueueJoinRoomConsumer.name);

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly bullQueueService: BullQueueService,
    private readonly socketService: SocketService,
  ) {}

  @Process({
    name: 'join-room-backend',
    concurrency: 5,
  })
  async handleJoinRoom(job: Job<unknown>) {
    try {
      const { userId } = job.data as QueueStartJointRoomDto;

      const trip = await this.tripRepository.findOne({
        where: {
          customerId: userId,
          status: In([StatusEnum.ACCEPTED, StatusEnum.INPROGRESS, StatusEnum.MEETING]),
        },
      });
      if (trip && trip.shoemakerId) {
        const socketCustomerId = await this.socketService.getSocketIdByUserId(userId);
        if (socketCustomerId)
          this.bullQueueService.addQueueJoinRoom('join-room-websocket', {
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
