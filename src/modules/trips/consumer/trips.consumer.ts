import RedisService from '@common/services/redis.service';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bull';
import * as h3 from 'h3-js';
import { Redis } from 'ioredis';
import { LessThan, Repository } from 'typeorm';

import { NOTIFICATIONS_SCREEN } from '@common/constants/notifications.constant';
import {
  EventEmitSocket,
  NOTIFICATIONS_SCREEN_CUSTOMER,
  NOTIFICATIONS_SCREEN_SHOEMAKER,
  PaymentEnum,
  PaymentStatusEnum,
  QUEUE_NAMES,
  RESOLUTION,
  RequestTripData,
  RoomNameAdmin,
  SocketEvents,
  StatusEnum,
  StatusScheduleShoemaker,
  calculateTimeDifferenceV2,
} from '@common/index';
import { FirebaseService } from '@common/services/firebase.service';
import { Customer, Notification, Shoemaker, Trip, TripCancellation } from '@entities/index';
// import { GatewaysService } from '@gateways/gateways.service';
import dayjs from 'dayjs';
import { SocketService } from '@modules/socket/socket.service';
import { BullQueueService } from '@modules/bullQueue/bullQueue.service';

@Processor(QUEUE_NAMES.CUSTOMERS_TRIP)
export class TripConsumer {
  private readonly logger = new Logger(TripConsumer.name);

  constructor(
    @InjectRepository(Shoemaker)
    private readonly shoemakerRepository: Repository<Shoemaker>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(TripCancellation)
    private readonly tripCancellationRepository: Repository<TripCancellation>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly socketService: SocketService,
    private readonly bullQueueService: BullQueueService,
    private readonly eventEmitter: EventEmitter2,
    private readonly firebaseService: FirebaseService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Function to handle the find closest shoemakers event
   * @param job RequestTripData & { userId: string }
   * @returns success | error | not-found
   */
  @Process('find-closest-shoemakers')
  async handleFindClosestShoemakers(job: Job<unknown>) {
    try {
      await this.processFindClosestShoemakers(job);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Function to handle the trip schedule event
   * @param job RequestTripData & { userId: string }
   * @returns success | error | not-found
   */
  @Process('trip-schedule')
  async handleTripSchedule(job: Job<unknown>) {
    const { tripId, userId, statusSchedule } = job.data as RequestTripData;
    try {
      console.log('🚀 ~ TripConsumer ~ handleTripSchedule ~ tripId:', tripId);
      if (statusSchedule == StatusScheduleShoemaker.findShoemaker) {
        return this.processFindClosestShoemakers(job, true);
      } else {
        console.log('Send notification');
        const currentJob = await this.bullQueueService.getQueueTripById(job.id);
        if (!currentJob) {
          return false;
        }

        const trip = await this.tripRepository
          .createQueryBuilder(Trip.name)
          .leftJoinAndSelect(`${Trip.name}.customer`, 'customer')
          .leftJoinAndSelect(`${Trip.name}.shoemaker`, 'shoemaker')
          .where({
            id: tripId,
          })
          .select([Trip.name, 'customer.fcmToken', 'shoemaker.fcmToken', 'customer.id', 'shoemaker.id'])
          .getOne();

        if (trip.shoemaker?.fcmToken) {
          await this.firebaseService.send({
            title: 'TAKER',
            body: `Đơn hàng của bạn tại ${trip.address} sắp đến lịch hẹn hãy mở app để kiểm tra`,
            token: trip.shoemaker.fcmToken,
            data: {
              screen: NOTIFICATIONS_SCREEN_SHOEMAKER.ACTIVITY,
              isSchedule: '1',
            },
          });
        }

        if (trip.customer?.fcmToken) {
          await this.firebaseService.send({
            title: 'TAKER',
            body: `Sắp đến thời gian cho đơn hàng đặt lịch của bạn. Hãy mở app để kiểm tra thông tin chi tiết.`,
            token: trip.customer.fcmToken,
            data: {
              screen: NOTIFICATIONS_SCREEN_CUSTOMER.HOME,
            },
          });
        }

        // customer join room
        const socketCustomerId = await this.socketService.getSocketIdByUserId(trip.customer.id);
        const socketShoemakerId = await this.socketService.getSocketIdByUserId(trip.shoemaker.id);
        if (socketCustomerId && socketShoemakerId) {
          this.bullQueueService.addQueueJoinRoom('join-room-websocket', {
            roomName: trip.shoemaker.id,
            socketId: socketCustomerId,
          });
        }
        return;
      }
    } catch (error) {
      this.bullQueueService.addQueueTrip(
        'trip-schedule',
        { tripId, userId, statusSchedule: StatusScheduleShoemaker.sendNotification },
        {
          removeOnComplete: true,
          delay: 5 * 1000,
        },
      );
      this.logger.error(error);
    }
  }

  /**
   * Function to process the find closest shoemakers event
   * @param job RequestTripData & { userId: string }
   */
  async processFindClosestShoemakers(job: Job<unknown>, isSchedule?: boolean) {
    try {
      const { tripId, userId } = job.data as RequestTripData & {
        userId: string;
      };
      // Check if the trip exists and is searching
      const trip = await this.tripRepository.findOne({
        select: {
          id: true,
          address: true,
          status: true,
          totalPrice: true,
          paymentMethod: true,
          latitude: true,
          longitude: true,
          orderId: true,
          addressNote: true,
          paymentStatus: true,
          income: true,
          createdAt: true,
          scheduleTime: true,
          // services: {
          //   price: true,
          //   discount: true,
          //   quantity: true,
          //   name: true,
          //   discountPrice: true,
          // },
        },
        where: { id: tripId },
        relations: ['services'],
      });
      const socketCustomerId = await this.socketService.getSocketIdByUserId(userId);

      if (!trip || trip.status !== StatusEnum.SEARCHING) {
        socketCustomerId &&
          this.socketService.sendMessageToRoom({
            data: {
              type: 'error',
              data: "Trip doesn't exist or is not searching for shoemakers.",
            },
            event: 'find-closest-shoemakers',
            roomName: socketCustomerId,
          });

        return;
      }

      if (trip.paymentMethod === PaymentEnum.CREDIT_CARD && trip.paymentStatus !== PaymentStatusEnum.PAID) {
        socketCustomerId &&
          this.socketService.sendMessageToRoom({
            data: {
              type: 'error',
              data: 'Trip is not paid yet. Please pay the trip first.',
            },
            event: 'find-closest-shoemakers',
            roomName: socketCustomerId,
          });

        return;
      }

      const customer = await this.customerRepository.findOneBy({ id: userId });

      const h = h3.latLngToCell(Number(trip.latitude), Number(trip.longitude), RESOLUTION);

      // Find around 5km2, with 800 items
      const k = 12;
      const nearbyShoemakers = h3.gridDisk(h, k);
      this.logger.log(`nearbyShoemakers found with length nearbyShoemakers ${nearbyShoemakers.length}`);
      // Find shoemakers in the same cell
      const query = this.shoemakerRepository.createQueryBuilder('shoemaker');
      query.where('shoemaker.latLongToCell IN (:...h3Index)', {
        h3Index: nearbyShoemakers,
      });
      // Make sure after the shoemaker declined the trip, he won't be notified again
      query.andWhere('shoemaker.id NOT IN (SELECT shoemakerId FROM trip_cancellations WHERE tripId = :tripId AND shoemakerId IS NOT NULL)', {
        tripId: tripId,
      });
      query.andWhere({ isOnline: true, isOn: true });
      // Check tripSchedule and add condition
      if (isSchedule) {
        query.andWhere({ isSchedule: false });
      } else {
        query.andWhere({ isTrip: false });
      }

      if (PaymentEnum.OFFLINE_PAYMENT === trip.paymentMethod) {
        //  balance - free >= -100k
        const balanceLimit = -100000;
        query.innerJoin('shoemaker.wallet', 'wallet', 'wallet.balance >= :balance', { balance: balanceLimit + (trip.fee || 0) });
      }

      query.take(20);

      let shoemakers = await query.getMany();

      //when book now check user isSchedule and remove shoemaker
      const shoemakerSkip = [];
      if (isSchedule) {
        const shoemakerHasSchedule = shoemakers.filter((i) => i.isSchedule);
        const date = new Date();
        const shoemakerComingSoon = await Promise.all(
          shoemakerHasSchedule.map((i) =>
            this.tripRepository.exists({
              where: {
                status: StatusEnum.ACCEPTED,
                shoemakerId: i.id,
                scheduleTime: LessThan(date.getTime() + 15 * 60 * 1000),
              },
            }),
          ),
        );
        if (shoemakerComingSoon.includes(true)) {
          shoemakerHasSchedule.forEach((i, index) => {
            if (shoemakerComingSoon[index]) {
              shoemakerSkip.push(i.id);
            }
          });
        }
      }
      shoemakers = shoemakers.filter((i) => !shoemakerSkip.includes(i.id));

      // Calculate time difference between customer and shoemakers
      const shoemakersWithTime = shoemakers.map((shoemaker) => {
        const { time, distance } = calculateTimeDifferenceV2(Number(shoemaker.latitude), Number(shoemaker.longitude), Number(trip.latitude), Number(trip.longitude));
        return { ...shoemaker, time, distance };
      });

      // Sort shoemakers by time in ascending order
      shoemakersWithTime.sort((a, b) => a.time - b.time);

      // Loop through the shoemakers
      let shoemakerIdAccepted = null;
      let isJobCanceled = false;

      // Update status Trip
      await this.redis.hset(`trips:info:${tripId}`, 'status', 'pending');

      // SendAll user(Nhattm update)
      const sendAllShoemaker = await Promise.all(
        shoemakersWithTime.map(async (shoemaker) => {
          if (job.id) {
            console.log('[FIND-SHOEMAKER][LOOP]shoemaker', shoemaker.id, shoemaker.time, shoemaker.fullName);
            const currentJob = await this.bullQueueService.getQueueTripById(job.id);
            if (!currentJob) {
              isJobCanceled = true;
              return false;
            }

            // Send notification to the shoemaker
            const shoemakerSocketId = await this.socketService.getSocketIdByUserId(shoemaker.id);
            shoemakerSocketId &&
              (await this.socketService.sendMessageToRoom({
                data: {
                  fullName: customer.fullName,
                  phone: customer.phone,
                  avatar: customer.avatar,
                  location: trip.address,
                  tripId: trip.id,
                  time: shoemaker.time,
                  latitude: trip.latitude,
                  longitude: trip.longitude,
                  services: trip.services.map(({ price, discount, name, discountPrice, quantity }) => ({
                    price,
                    discount,
                    name,
                    discountPrice,
                    quantity,
                  })),
                  totalPrice: trip.totalPrice,
                  paymentMethod: trip.paymentMethod,
                  addressNote: trip.addressNote,
                  distance: shoemaker.distance,
                  income: trip.income,
                  scheduleTime: +trip.scheduleTime,
                  orderId: trip.orderId,
                },
                event: 'shoemaker-request-trip',
                roomName: shoemakerSocketId,
              }));

            // Send notification firebase
            try {
              if (shoemaker.fcmToken) {
                this.firebaseService
                  .send({
                    title: 'TAKER',
                    body: `Đơn hàng mới đang chờ bạn nhận. Hãy vào ứng dụng ngay`,
                    token: shoemaker.fcmToken,
                    data: {
                      fullName: customer?.fullName?.toString() || '',
                      phone: customer?.phone?.toString() || '',
                      location: trip?.address?.toString() || '',
                      avatar: customer?.avatar?.toString() || '',
                      tripId: trip?.id?.toString() || '',
                      time: shoemaker?.time?.toString() || '',
                      latitude: trip?.latitude?.toString() || '',
                      longitude: trip?.longitude?.toString() || '',
                      services: JSON.stringify(
                        trip.services.map(({ price, discount, name, discountPrice, quantity }) => ({
                          price: price.toString(),
                          discount: discount.toString(),
                          name: name.toString(),
                          discountPrice: discountPrice.toString(),
                          quantity: quantity.toString(),
                        })),
                      ),
                      totalPrice: trip?.totalPrice?.toString() || '',
                      paymentMethod: trip?.paymentMethod?.toString() || '',
                      addressNote: trip?.addressNote?.toString() || '',
                      distance: shoemaker?.distance?.toString() || '',
                      income: trip.income.toString() || '0',
                      timeOrder: trip.createdAt.toISOString(),
                      isSchedule: isSchedule ? '1' : '0',
                    },
                  })
                  .catch((ee) => {
                    this.logger.error(`Send firebase notification error with ${JSON.stringify(ee)}`);
                  });
              }
            } catch (error) {
              console.log('[TripConsumer] SEND NOTIFICATION TO SHOEMAKER', error);
            }

            // if shoemaker socket is not available, store to redis
            await Promise.all([
              this.redis.setExpire(
                `pending-trip-${shoemaker.id}`,
                JSON.stringify({
                  shoemaker,
                  tripId,
                  jobId: job.id,
                  customerId: userId,
                  orderId: trip.orderId,
                  customerFcmToken: customer.fcmToken,
                  customerFullName: customer.fullName,
                  customerPhone: customer.phone,
                  customerAvatar: customer.avatar,
                  income: trip.income,
                  scheduleTime: +trip.scheduleTime,
                }),
                60,
              ),
              this.redis.sadd(`trips:request:${tripId}`, shoemaker.id),
            ]);

            // Set a timeout to automatically resolve the promise after 60 seconds
            setTimeout(async () => {
              const checkShoemakerAccess = await this.redis.sismember(`trips:accepted:${tripId}`, shoemaker.id);
              // shoemaker auto cancel
              if (!checkShoemakerAccess) {
                console.log('Shoemaker auto cancelled', shoemaker.fullName);
                this.eventEmitter.emit('shoemaker-cancelation', {
                  tripId: trip.id,
                  shoemakerId: shoemaker.id,
                });
              }
            }, 60000);

            return true;
          }
        }),
      );

      const waitShoemakerAccess = await new Promise((resolve, reject) => {
        setTimeout(async () => {
          console.log('Hết thời gian chờ');
          // Get shoemaker access
          const shoemakerIdAccepted = await this.redis.hget(`trips:info:${tripId}`, 'shoemakerId');
          // Delete key for trip
          await this.redis.del(`trips:info:${tripId}`);
          resolve(shoemakerIdAccepted);
        }, 62000);
      });

      // If no shoemaker accepted and job not cancel, emit a 'not found' message to the client
      console.log('Check shoemaker access');
      if (!isJobCanceled && !shoemakerIdAccepted) {
        if (isSchedule && shoemakers.length) {
          if (job && (await job.isActive())) {
            console.log('Move to completed');
            await job.moveToCompleted('Canceled by customer', true);
          } else if (job) {
            await job.remove();
          }

          setTimeout(async () => {
            await this.bullQueueService.addQueueTrip(
              'trip-schedule',
              { tripId: trip.id, userId, statusSchedule: StatusScheduleShoemaker.findShoemaker },
              {
                removeOnComplete: true,
                jobId: job.id,
              },
            );
          }, 2000);
        } else {
          const tripCheck = await this.tripRepository.findOne({
            where: { id: tripId },
          });
          await this.tripRepository.update(tripId, { jobId: null });
          this.logger.log('[EMIT] No shoemaker found');
          socketCustomerId &&
            tripCheck.status === StatusEnum.SEARCHING &&
            (await this.socketService.sendMessageToRoom({
              data: {
                type: 'not-found',
                message: 'No shoemaker found',
                tripId: trip.id,
              },
              event: 'find-closest-shoemakers',
              roomName: socketCustomerId,
            }));
        }

        if (customer.fcmToken) {
          this.firebaseService
            .send({
              title: 'TAKER',
              body: 'Không tìm thấy thợ đánh giày phù hợp với yêu cầu của bạn. Vui lòng thử lại sau.',
              token: customer.fcmToken,
              data: {
                tripId: trip.id,
                type: 'not-found',
                screen: NOTIFICATIONS_SCREEN.ORDER,
              },
            })
            .catch(() => {});
        }
      }
      // Save to queue send notification when schedule
      if (isSchedule && shoemakerIdAccepted) {
        const currentJob = await this.bullQueueService.getQueueTripById(job.id);
        if (!currentJob) {
          return false;
        }
        console.log('Thêm queue chờ gửi thông báo');
        const delayTime = Math.max(trip.scheduleTime - dayjs().tz().valueOf() - 15 * 60 * 1000, 0);
        console.log('🚀 ~ TripConsumer ~ processFindClosestShoemakers ~ delayTime:', delayTime);
        const jobIdNotice = `CUSTOMERS_TRIP_SEND_NOTICE-${trip.id}`;
        await this.bullQueueService.addQueueTrip(
          'trip-schedule',
          { tripId: trip.id, userId, statusSchedule: StatusScheduleShoemaker.sendNotification },
          {
            // delay: 30 * 1000,
            delay: delayTime,
            jobId: jobIdNotice,
            removeOnComplete: true,
          },
        );
        await this.tripRepository.update(tripId, { jobId: jobIdNotice });
      }
    } catch (error) {
      this.logger.error(error);
    } finally {
      // Remove jobId from trip
      const { tripId } = job.data as RequestTripData & {
        userId: string;
      };
      console.log('tripId--finally', tripId);
      if (!isSchedule) {
        await this.tripRepository.update(tripId, { jobId: null });
      }
    }
  }

  /**
   * Function to handle the shoemaker cancelation event
   * @param data { tripId: string, shoemakerId: string }
   */
  @OnEvent('shoemaker-cancelation')
  @Process('shoemaker-cancellation')
  async handleShoemakerCancelationListener(data: { tripId: string; shoemakerId: string }) {
    try {
      await this.tripCancellationRepository.save({
        tripId: data.tripId,
        shoemakerId: data.shoemakerId,
        reason: 'Hệ thống tự động hủy đơn do hết thời gian chờ',
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Function to handle the shoemaker-check-trip-pending event
   * @param data { userId: string }
   */
  @OnEvent('shoemaker-check-trip-pending')
  async handleShoemakerCheckTripPendingListener(data: { userId: string }) {
    try {
      const { userId } = data;
      this.logger.log(`pendingTrip shoemakerId: ${userId}`);
      const redisClient = this.redis.getClient();
      const pendingTrip = await this.redis.get(`pending-trip-${userId}`);
      this.logger.log(`pendingTrip: ${pendingTrip}`);
      if (pendingTrip) {
        const ttl = await redisClient.ttl(`pending-trip-${userId}`);
        if (ttl < 2) {
          console.log('Skip pending trip TTL', ttl);
          return;
        }
        const { shoemaker, tripId, jobId, customerId, orderId, customerFcmToken, customerFullName, customerAvatar, customerPhone, scheduleTime } = JSON.parse(pendingTrip);

        const shoemakerSocketId = await this.socketService.getSocketIdByUserId(userId);

        if (!shoemakerSocketId) return;
        this.logger.log(`ttl: ${ttl}`);
        await new Promise(async (resolve) => {
          console.log('Chạy promiseeeeeee');
          //Update when shoemaker not accepted then emit data customer to shoemaker
          const trip = await this.tripRepository.findOne({
            select: {
              id: true,
              address: true,
              status: true,
              totalPrice: true,
              paymentMethod: true,
              latitude: true,
              longitude: true,
              orderId: true,
              addressNote: true,
              paymentStatus: true,
            },
            where: { id: tripId, status: StatusEnum.SEARCHING },
            relations: ['services'],
          });
          // console.log('Shoemaker', shoemaker.fullName);
          // console.log('🚀 ~ TripConsumer ~ awaitnewPromise ~ trip:', trip, shoemakerSocket.id);

          if (shoemakerSocketId) {
            setTimeout(async () => {
              await this.socketService.sendMessageToRoom({
                data: {
                  fullName: customerFullName,
                  phone: customerPhone,
                  avatar: customerAvatar,
                  location: trip.address,
                  tripId: trip.id,
                  time: shoemaker.time,
                  latitude: trip.latitude,
                  longitude: trip.longitude,
                  services: trip.services.map(({ price, discount, name, discountPrice, quantity }) => ({
                    price,
                    discount,
                    name,
                    discountPrice,
                    quantity,
                  })),
                  totalPrice: trip.totalPrice,
                  paymentMethod: trip.paymentMethod,
                  addressNote: trip.addressNote,
                  distance: shoemaker.distance,
                  scheduleTime: +scheduleTime,
                },
                event: 'shoemaker-request-trip',
                roomName: shoemakerSocketId,
              });
            }, 2000);
          }

          // responseListener wait shoemaker socket
          // const responseListener = async (data) => {
          //   console.log('🚀 ~ TripConsumer ~ responseListener ~ data:', data);
          //   // Check if the jobId still exists
          //   const currentTrip = await this.tripRepository.findOne({
          //     where: { id: tripId },
          //     select: {
          //       status: true,
          //       id: true,
          //     },
          //   });
          //   if (currentTrip.status != StatusEnum.SEARCHING) {
          //     // Notify the previous shoemaker that the trip has been canceled
          //     if (currentTrip.status == StatusEnum.CUSTOMER_CANCEL) {
          //       // shoemakerSocket &&
          //       //   shoemakerSocket.emit('trip-update', {
          //       //     type: 'customer-cancel',
          //       //     message: 'Trip has been canceled by the customer. You can now accept new trips.',
          //       //     tripId,
          //       //   });
          //     } else if (currentTrip.status == StatusEnum.ACCEPTED) {
          //       // shoemakerSocket &&
          //       //   shoemakerSocket.emit('trip-update', {
          //       //     type: 'timeout',
          //       //     message: 'Trip has been sent to another shoemaker due to no response',
          //       //   });
          //     }
          //     // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener); // Remove the event listener
          //     return; // Exit the function to ensure nothing else is executed
          //   } else {
          //     // If the shoemaker accepted, resolve the promise with the shoemaker
          //     if (data.accepted) {
          //       // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener); // Remove the event listener

          //       await this.tripRepository.update(tripId, {
          //         status: StatusEnum.ACCEPTED,
          //         shoemakerId: userId,
          //       });

          //       // const socket = await this.gateWaysService.getSocket(customerId);
          //       // socket &&
          //       //   socket.emit('find-closest-shoemakers', {
          //       //     type: 'success',
          //       //     data: {
          //       //       fullName: shoemaker?.fullName,
          //       //       time: shoemaker?.time,
          //       //       phone: shoemaker?.phone,
          //       //       avatar: shoemaker?.avatar,
          //       //       id: shoemaker?.id,
          //       //       lat: shoemaker?.latitude,
          //       //       lng: shoemaker?.longitude,
          //       //     },
          //       //   });

          //       // Update the shoemaker status to isTrip
          //       await this.shoemakerRepository.update(shoemaker.id, {
          //         isTrip: true,
          //       });
          //       // Create notification for the customer
          //       await this.notificationRepository.save({
          //         customerId,
          //         title: 'Đặt hàng thành công',
          //         content: `Bạn đã đặt hàng thành công đơn hàng ${orderId}. Thời gian dự kiến thợ đánh giày đến là ${Math.round(shoemaker.time)} phút.`,
          //       });

          //       if (customerFcmToken) {
          //         this.firebaseService
          //           .send({
          //             title: 'TAKER',
          //             body: `Bạn đã đặt hàng thành công đơn hàng ${orderId}. Thời gian dự kiến thợ đánh giày đến là ${Math.round(shoemaker.time)} phút.`,
          //             token: customerFcmToken,
          //             data: {
          //               fullName: shoemaker?.fullName,
          //               phone: shoemaker?.phone,
          //               avatar: shoemaker?.avatar,
          //               id: shoemaker?.id,
          //               lat: shoemaker?.latitude,
          //               lng: shoemaker?.longitude,
          //             },
          //           })
          //           .catch(() => {});
          //       }

          //       // Join the customer to the shoemaker room to receive updates if trip not schedule
          //       if (!scheduleTime) {
          //         // socket && socket.join(shoemaker.id);
          //       } else {
          //         // Add queue send notification if trip schedule
          //         console.log('Thêm queue chờ gửi thông báo');
          //         const delayTime = Math.max(+scheduleTime - dayjs().tz().valueOf() - 15 * 60 * 1000, 0);
          //         console.log('🚀 ~ TripConsumer ~ processFindClosestShoemakers ~ delayTime:', delayTime);
          //         const jobIdNotice = `CUSTOMERS_TRIP_SEND_NOTICE-${trip.id}`;
          //         await this.queue.add(
          //           'trip-schedule',
          //           { tripId: trip.id, userId, statusSchedule: StatusScheduleShoemaker.sendNotification },
          //           {
          //             delay: 30 * 1000,
          //             // delay: delayTime,
          //             jobId: jobIdNotice,
          //             removeOnComplete: true,
          //           },
          //         );
          //       }

          //       try {
          //         const job = await this.queue.getJob(jobId);
          //         if (job && (await job.isActive())) {
          //           await job.moveToCompleted('Canceled by customer', true);
          //         } else if (job) {
          //           await job.remove();
          //         }
          //       } catch (error) {
          //         console.log('🚀 ~ TripConsumer ~ responseListener ~ error:773', error);
          //       }
          //     } else {
          //       this.logger.log(`Send request to shoemaker`);
          //       // If the shoemaker declined, resolve the promise with null
          //       this.eventEmitter.emit('shoemaker-cancelation', {
          //         tripId,
          //         shoemakerId: userId,
          //       });
          //       // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener); // Remove the event listener
          //     }
          //   }
          // };
        });
      }
    } catch (error) {
      console.log('🚀 ~ TripConsumer ~ handleShoemakerCheckTripPendingListener ~ error:', error);
      this.logger.error(error);
    }
  }
}
