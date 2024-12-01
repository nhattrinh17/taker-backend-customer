import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Customer, Trip } from '@entities/index';
import { S3Service, QUEUE_NAMES } from '@common/index';

import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

import { JoinRoomListener } from './listeners/join-room.listener';
import { JoinRoomConsumer } from './consumers/join-room.consumer';
import { LeaveRoomListener } from './listeners/leave-room.listener';
import { LeaveRoomConsumer } from './consumers/leave-room.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Trip]),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.JOIN_ROOM },
      { name: QUEUE_NAMES.LEAVE_ROOM },
    ),
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    S3Service,
    JoinRoomListener,
    JoinRoomConsumer,
    LeaveRoomListener,
    LeaveRoomConsumer,
  ],
})
export class ProfileModule {}
