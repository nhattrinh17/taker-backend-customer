import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Customer, Trip } from '@entities/index';
import { S3Service, QUEUE_NAMES } from '@common/index';

import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

import { JoinRoomListener } from './listeners/join-room.listener';
import { LeaveRoomListener } from './listeners/leave-room.listener';
import { BullQueueModule } from '@modules/bullQueue/bullQueue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Trip]), BullQueueModule],
  controllers: [ProfileController],
  providers: [
    //
    ProfileService,
    S3Service,
    JoinRoomListener,
    LeaveRoomListener,
  ],
})
export class ProfileModule {}
