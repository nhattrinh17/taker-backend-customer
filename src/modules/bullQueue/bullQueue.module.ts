import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullQueueService } from './bullQueue.service';
import { QUEUE_NAMES } from '@common/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseService } from '@common/index';
import { SocketModule } from '@modules/socket/socket.module';
import { Customer, Shoemaker, Trip, TripCancellation } from '@entities/index';
import { BullQueueJoinRoomConsumer } from './bullQueueJoinRoom.consumer';
import { BullQueueLeaveRoomConsumer } from './bullQueueLeaveRoom.consumer';
import { BullQueueTripConsumer } from './bullQueueTrips.consumer';
import RedisService from '@common/services/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Shoemaker, Customer, TripCancellation]),
    SocketModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          prefix: `{bull-queue}`,
          redis: {
            host: configService.get('QUEUE_HOST'),
            port: parseInt(configService.get('QUEUE_PORT'), 10),
            password: String(configService.get('QUEUE_PASS')),
          },
          defaultJobOptions: {
            attempts: 20,
            removeOnComplete: 100,
            removeOnFail: {
              age: 60 * 60,
              count: 100,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.LEAVE_ROOM,
      },
      {
        name: QUEUE_NAMES.JOIN_ROOM,
      },
      {
        name: QUEUE_NAMES.CUSTOMERS_TRIP,
      },
    ),
  ],
  providers: [
    FirebaseService,
    BullQueueService,
    RedisService,
    // Consumer
    BullQueueJoinRoomConsumer,
    BullQueueLeaveRoomConsumer,
    BullQueueTripConsumer,
  ],
  exports: [BullQueueService],
})
export class BullQueueModule {}
