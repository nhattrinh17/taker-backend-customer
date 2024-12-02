import RedisService from '@common/services/redis.service';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TripConsumer } from './consumer/trips.consumer';
import { TripLogListener } from './listeners/log-trip.listener';
import { RequestTripListener } from './listeners/request-trip.listener';
import { TripSubscriber } from './subscribers/trip.subscriber';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

import { QUEUE_NAMES } from '@common/index';

import { FirebaseService } from '@common/services/firebase.service';
import { Customer, Notification, RatingSummary, Service, Shoemaker, Transaction, Trip, TripCancellation, TripLog, TripRating, Wallet, WalletLog } from '@entities/index';
import { SocketModule } from '@modules/socket/socket.module';
import { BullQueueModule } from '@modules/bullQueue/bullQueue.module';
import { ShoemakerRepository } from 'src/database/repository/shoemaker.repository';
import { CustomerRepository } from 'src/database/repository/customer.repository';

@Module({
  imports: [
    //
    TypeOrmModule.forFeature([Trip, Shoemaker, Service, TripCancellation, TripRating, Customer, Notification, RatingSummary, Wallet, Transaction, WalletLog, TripLog]),
    SocketModule,
    BullQueueModule,
  ],
  controllers: [TripsController],
  providers: [
    //
    TripsService,
    {
      provide: 'ShoemakerRepositoryInterface',
      useClass: ShoemakerRepository,
    },
    {
      provide: 'CustomerRepositoryInterface',
      useClass: CustomerRepository,
    },
    RequestTripListener,
    TripConsumer,
    FirebaseService,
    TripSubscriber,
    TripLogListener,
    RedisService,
  ],
})
export class TripsModule {}
