import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import Bull, { Queue } from 'bull';
import { QueueHandleLeaveRoomBEDto, QueueLeaveRoomDto, QueueStartJointRoomDto } from './dto/bullQueue.dto';
import { QUEUE_NAMES } from '@common/constants';

@Injectable()
export class BullQueueService {
  constructor(
    //
    @InjectQueue(QUEUE_NAMES.LEAVE_ROOM) private readonly leaveRoomQueue: Queue,
    @InjectQueue(QUEUE_NAMES.JOIN_ROOM) private readonly joinRoomQueue: Queue,
    @InjectQueue(QUEUE_NAMES.CUSTOMERS_TRIP) private readonly tripQueue: Queue,
  ) {}

  async addQueueLeaveRoom(name: string, dto: QueueLeaveRoomDto | QueueHandleLeaveRoomBEDto, option?: Bull.JobOptions): Promise<Bull.Job<any>> {
    return this.leaveRoomQueue.add(name, dto, option);
  }

  async addQueueJoinRoom(name: string, dto: QueueLeaveRoomDto | QueueStartJointRoomDto, option?: Bull.JobOptions): Promise<Bull.Job<any>> {
    return this.joinRoomQueue.add(name, dto, option);
  }

  async addQueueTrip(name: string, dto: any, option?: Bull.JobOptions): Promise<Bull.Job<any>> {
    return this.tripQueue.add(name, dto, option);
  }

  async getQueueTripById(jobId: string | number): Promise<Bull.Job<any>> {
    return this.tripQueue.getJob(jobId);
  }
}
