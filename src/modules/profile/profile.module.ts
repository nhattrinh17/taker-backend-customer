import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer, Trip } from '@entities/index';
import { S3Service } from '@common/index';

import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

import { BullQueueModule } from '@modules/bullQueue/bullQueue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Trip]), BullQueueModule],
  controllers: [ProfileController],
  providers: [
    //
    ProfileService,
    S3Service,
  ],
})
export class ProfileModule {}
