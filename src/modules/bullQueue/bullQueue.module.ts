import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullQueueService } from './bullQueue.service';
import { QUEUE_NAMES } from '@common/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseService } from '@common/index';
import { SocketModule } from '@modules/socket/socket.module';
import { Trip } from '@entities/index';
import { BullQueueJoinRoomConsumer } from './bullQueueJoinRoom.consumer';
import { BullQueueLeaveRoomConsumer } from './bullQueueLeaveRoom.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip]),
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
    // Consumer
    BullQueueJoinRoomConsumer,
    BullQueueLeaveRoomConsumer,
  ],
  exports: [BullQueueService],
})
export class BullQueueModule {}
