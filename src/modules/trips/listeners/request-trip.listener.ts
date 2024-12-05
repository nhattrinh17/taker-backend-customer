import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';

import { EventEmitSocket, FirebaseService, QUEUE_NAMES, RequestTripData, RoomNameAdmin, StatusEnum } from '@common/index';
import { Notification, Trip } from '@entities/index';
import RedisService from '@common/services/redis.service';
import { SocketService } from '@modules/socket/socket.service';
import { ShoemakerRepositoryInterface } from 'src/database/interface/shoemaker.interface';
import { CustomerRepositoryInterface } from 'src/database/interface/customer.interface';
import { DataShoemakerResponseTripDto } from '../dto/request-trip.dto';
import { BullQueueService } from '@modules/bullQueue/bullQueue.service';

@Injectable()
export class RequestTripListener implements OnModuleInit {
  private readonly logger = new Logger(RequestTripListener.name);
  constructor(
    private readonly bullQueueService: BullQueueService,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly redisService: RedisService,
    private readonly socketService: SocketService,
    @Inject('ShoemakerRepositoryInterface')
    private readonly shoemakerRepository: ShoemakerRepositoryInterface,
    @Inject('CustomerRepositoryInterface')
    private readonly customerRepository: CustomerRepositoryInterface,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async onModuleInit() {
    const subscriber = this.redisService.getSubscriberClient(); // Redis Subscriber
    await subscriber.subscribe('shoemaker-response-trip'); // Đăng ký kênh

    subscriber.on('message', async (channel, message) => {
      if (channel === 'shoemaker-response-trip') {
        try {
          const { event, tripId, shoemakerId, distance, time, customerId, jobId, scheduleTime, orderId }: DataShoemakerResponseTripDto & { event: string } = JSON.parse(message);

          if (event === 'trip-accepted') {
            // Clean all job other shoemaker
            const shoemakerRequest = await this.redisService.smembers(`trips:request:${tripId}`);
            await Promise.all(shoemakerRequest.map((i) => this.redisService.del(`pending-trip-${i}`)));

            const socketCustomerId = await this.socketService.getSocketIdByUserId(customerId);

            await this.tripRepository.update(tripId, {
              status: StatusEnum.ACCEPTED,
              shoemakerId,
            });
            const shoemaker = await this.shoemakerRepository.findOneById(shoemakerId, ['fullName', 'phone']);

            // send to admin remote trip
            this.socketService.sendMessageToRoom({
              data: {
                idTrip: tripId,
                status: StatusEnum.ACCEPTED,
                shoemaker: {
                  fullName: shoemaker.fullName,
                  phone: shoemaker.phone,
                },
              },
              event: EventEmitSocket.UpdateTripStatus,
              roomName: RoomNameAdmin,
            });

            // send to customer socket
            socketCustomerId &&
              (await this.socketService.sendMessageToRoom({
                data: {
                  type: 'success',
                  data: {
                    fullName: shoemaker?.fullName,
                    time,
                    distance,
                    phone: shoemaker?.phone,
                    avatar: shoemaker?.avatar,
                    id: shoemaker?.id,
                    lat: shoemaker?.latitude,
                    lng: shoemaker?.longitude,
                    scheduleTime: scheduleTime,
                  },
                },
                event: 'find-closest-shoemakers',
                roomName: socketCustomerId,
              }));

            // Update the shoemaker status to isTrip
            if (scheduleTime) {
              await this.shoemakerRepository.findByIdAndUpdate(shoemakerId, { isSchedule: true });
            } else {
              await this.shoemakerRepository.findByIdAndUpdate(shoemakerId, { isTrip: true });
            }

            // Create notification for the customer
            const customer = await this.customerRepository.findOneById(customerId);
            if (customer.fcmToken) {
              this.firebaseService
                .send({
                  title: 'TAKER',
                  body: scheduleTime ? `Bạn đã đặt hàng thành công đơn hàng đặt lịch ${orderId}.` : `Bạn đã đặt hàng thành công đơn hàng ${orderId}. Thời gian dự kiến thợ đánh giày đến là ${Math.round(+time)} phút.`,
                  token: customer.fcmToken,
                  data: {
                    fullName: shoemaker?.fullName,
                    phone: shoemaker?.phone,
                    avatar: shoemaker?.avatar,
                    id: shoemaker?.id,
                    lat: shoemaker?.latitude,
                    lng: shoemaker?.longitude,
                  },
                })
                .catch(() => {});
            }
            await this.notificationRepository.save({
              customerId: customerId,
              title: 'Đặt hàng thành công',
              content: scheduleTime ? `Bạn đã đặt hàng thành công đơn hàng đặt lịch ${orderId}.` : `Bạn đã đặt hàng thành công đơn hàng ${orderId}. Thời gian dự kiến thợ đánh giày đến là ${Math.round(+time)} phút.`,
            });

            if (!scheduleTime) {
              // customer Join room shoemaker
              socketCustomerId &&
                this.bullQueueService.addQueueJoinRoom('join-room-websocket', {
                  roomName: shoemakerId,
                  socketId: socketCustomerId,
                });
            }
          }
        } catch (error) {
          this.logger.error(`Error processing message: ${error.message}`, error);
        }
      }
    });
  }

  // @OnEvent('find-closest-shoemakers')
  // async handleFindClosestShoemakersListener(
  //   data: RequestTripData & { userId: string },
  // ) {
  //   try {
  //     // Create promise delay 1 seconds
  //     const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  //     await delay(1000);
  //     // Find closest shoemakers
  //     const trip = await this.tripRepository.findOneBy({ id: data.tripId });
  //     if (!trip?.jobId) {
  //       const job = await this.queue.add('find-closest-shoemakers', data, {
  //         removeOnComplete: true,
  //       });
  //       await this.tripRepository.update(id, { jobId: job.id as string });
  //     }
  //   } catch (error) {
  //     this.logger.error(error);
  //   }
  // }
}
