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
    // private readonly gateWaysService: GatewaysService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue(QUEUE_NAMES.CUSTOMERS_TRIP) private queue: Queue,
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
        const currentJob = await this.queue.getJob(job.id);
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
        // const socketCustomer = await this.gateWaysService.getSocket(trip.customer.id);
        // const socketShoemaker = await this.gateWaysService.getSocket(trip.shoemaker.id);
        // if (socketShoemaker && socketCustomer) {
        //   socketCustomer.join(trip.shoemaker.id);
        // }
        return;
      }
    } catch (error) {
      this.queue.add(
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
      // TODO: Update socket gateway
      // const socket = await this.gateWaysService.getSocket(userId);

      if (!trip || trip.status !== StatusEnum.SEARCHING) {
        // TODO: Update socket gateway
        // socket &&
        //   socket.emit('find-closest-shoemakers', {
        //     type: 'error',
        //     data: "Trip doesn't exist or is not searching for shoemakers.",
        //   });
        return;
      }

      if (trip.paymentMethod === PaymentEnum.CREDIT_CARD && trip.paymentStatus !== PaymentStatusEnum.PAID) {
        // TODO: Update socket gateway
        // socket &&
        //   socket.emit('find-closest-shoemakers', {
        //     type: 'error',
        //     data: 'Trip is not paid yet. Please pay the trip first.',
        //   });
        return;
      }

      const customer = await this.customerRepository.findOneBy({ id: userId });
      // console.log(
      //   '🚀 ~ TripConsumer ~ processFindClosestShoemakers ~ customer:',
      //   customer,
      // );

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
      let shoemakerAccepted = null;
      let nextShoemakerNotified = false;
      let isJobCanceled = false;

      // SendAll user(Nhattm update)
      const sendAllShoemaker = await Promise.all(
        shoemakersWithTime.map(async (shoemaker) => {
          if (job.id) {
            console.log('[FIND-SHOEMAKER][LOOP]shoemaker', shoemaker.id, shoemaker.time, shoemaker.fullName);
            const currentJob = await this.queue.getJob(job.id);
            if (!currentJob) {
              isJobCanceled = true;
              return false;
            }

            // Send notification to the shoemaker
            // TODO: Update socket gateway
            // const shoemakerSocket = await this.gateWaysService.getSocket(shoemaker.id);
            // shoemakerSocket &&
            //   shoemakerSocket.emit('shoemaker-request-trip', {
            //     fullName: customer.fullName,
            //     phone: customer.phone,
            //     avatar: customer.avatar,
            //     location: trip.address,
            //     tripId: trip.id,
            //     time: shoemaker.time,
            //     latitude: trip.latitude,
            //     longitude: trip.longitude,
            //     services: trip.services.map(({ price, discount, name, discountPrice, quantity }) => ({
            //       price,
            //       discount,
            //       name,
            //       discountPrice,
            //       quantity,
            //     })),
            //     totalPrice: trip.totalPrice,
            //     paymentMethod: trip.paymentMethod,
            //     addressNote: trip.addressNote,
            //     distance: shoemaker.distance,
            //     income: trip.income,
            //     scheduleTime: +trip.scheduleTime,
            //   });

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
            await this.redis.setExpire(
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
            );

            const response = await new Promise((resolve) => {
              // Set a timeout to automatically resolve the promise after 30 seconds
              const timeout = setTimeout(() => {
                nextShoemakerNotified = true;
                // shoemaker auto cancel
                if (!shoemakerAccepted) {
                  console.log('Shoemaker auto cancelled', shoemaker.fullName);
                  this.eventEmitter.emit('shoemaker-cancelation', {
                    tripId: trip.id,
                    shoemakerId: shoemaker.id,
                  });
                }
                // TODO: Update socket gateway
                // Remove the event listener to reduce memory usage
                // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener);
                resolve(null);
              }, 60000);

              // Define the response listener shoemaker
              const responseListener = async (data) => {
                // Check if the jobId still exists
                if (job.id) {
                  const currentJob = await this.queue.getJob(job.id);
                  console.log('currentJob', currentJob && (await currentJob.getState()));
                  if (!currentJob) {
                    isJobCanceled = true;
                    // TODO: Update socket gateway
                    // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener); // Remove the event listener
                    // Notify the previous shoemaker that the trip has been canceled
                    // shoemakerSocket &&
                    //   shoemakerSocket.emit('trip-update', {
                    //     type: 'customer-cancel',
                    //     message: 'The trip has been cancelled by the customer or has been accepted. You can now accept new trips.',
                    //     tripId: trip.id,
                    //   });
                    resolve(null);
                  }
                }
                // If the shoemaker accepted, resolve the promise with the shoemaker
                if (data.accepted) {
                  if (!shoemakerAccepted) {
                    resolve(shoemaker);
                  } else {
                    // TODO: Update socket gateway
                    // shoemakerSocket &&
                    //   shoemakerSocket.emit('trip-update', {
                    //     type: 'timeout',
                    //     message: 'Trip has been received.',
                    //   });
                    resolve(null);
                  }
                  // TODO: Update socket gateway
                  // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener); // Remove the event listener
                } else {
                  // TODO: Update socket gateway
                  // If the shoemaker declined, resolve the promise with null
                  // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener); // Remove the event listener
                  this.eventEmitter.emit('shoemaker-cancelation', {
                    tripId: trip.id,
                    shoemakerId: shoemaker.id,
                  });
                  resolve(null);
                }

                // Clear the timeout
                clearTimeout(timeout);
              };

              // TODO: Update socket gateway
              // Listen for a response from the shoemaker
              // shoemakerSocket && shoemakerSocket.on('shoemaker-response-trip', responseListener);
            });

            // If the shoemaker accepted, update the trip and break the loop
            if (response) {
              await Promise.all(shoemakers.map((i) => this.redis.del(`pending-trip-${i.id}`)));

              await this.tripRepository.update(tripId, {
                status: StatusEnum.ACCEPTED,
                shoemakerId: shoemaker.id,
              });

              // TODO: Update socket gateway
              // send to admin remote trip
              // this.gateWaysService.emitToRoomWithServer(RoomNameAdmin, EventEmitSocket.UpdateTripStatus, {
              //   idTrip: trip.id,
              //   status: StatusEnum.ACCEPTED,
              //   shoemaker: {
              //     fullName: shoemaker.fullName,
              //     phone: shoemaker.phone,
              //   },
              // });

              // TODO: Update socket gateway
              // console.log('send to customer', socket.connected);
              // socket &&
              //   socket.emit('find-closest-shoemakers', {
              //     type: 'success',
              //     data: {
              //       fullName: shoemaker?.fullName,
              //       time: shoemaker?.time,
              //       distance: shoemaker?.distance,
              //       phone: shoemaker?.phone,
              //       avatar: shoemaker?.avatar,
              //       id: shoemaker?.id,
              //       lat: shoemaker?.latitude,
              //       lng: shoemaker?.longitude,
              //       scheduleTime: trip.scheduleTime,
              //     },
              //   });
              shoemakerAccepted = shoemaker;

              // Update the shoemaker status to isTrip
              if (isSchedule) {
                await this.shoemakerRepository.update(shoemaker.id, { isSchedule: true });
              } else {
                await this.shoemakerRepository.update(shoemaker.id, { isTrip: true });
              }
              // Create notification for the customer
              await this.notificationRepository.save({
                customerId: userId,
                title: 'Đặt hàng thành công',
                content: isSchedule ? `Bạn đã đặt hàng thành công đơn hàng đặt lịch ${trip.orderId}.` : `Bạn đã đặt hàng thành công đơn hàng ${trip.orderId}. Thời gian dự kiến thợ đánh giày đến là ${Math.round(shoemaker.time)} phút.`,
              });

              if (customer.fcmToken) {
                this.firebaseService
                  .send({
                    title: 'TAKER',
                    body: isSchedule ? `Bạn đã đặt hàng thành công đơn hàng đặt lịch ${trip.orderId}.` : `Bạn đã đặt hàng thành công đơn hàng ${trip.orderId}. Thời gian dự kiến thợ đánh giày đến là ${Math.round(shoemaker.time)} phút.`,
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

              // Join the customer to the shoemaker room to receive updates

              if (!isSchedule) {
                // TODO: Update socket gateway
                // socket && socket.join(shoemaker.id);
              }
              return true;
            }
            // return false
            return false;
          }
        }),
      );

      // If no shoemaker accepted and job not cancel, emit a 'not found' message to the client
      if (!isJobCanceled && !shoemakerAccepted) {
        if (isSchedule && shoemakers.length) {
          if (job && (await job.isActive())) {
            console.log('Move to completed');
            await job.moveToCompleted('Canceled by customer', true);
          } else if (job) {
            await job.remove();
          }

          setTimeout(async () => {
            await this.queue.add(
              'trip-schedule',
              { tripId: trip.id, userId, statusSchedule: StatusScheduleShoemaker.findShoemaker },
              {
                removeOnComplete: true,
                jobId: job.id,
              },
            );
          }, 3000);
        } else {
          const tripCheck = await this.tripRepository.findOne({
            where: { id: tripId },
          });
          await this.tripRepository.update(tripId, { jobId: null });
          this.logger.log('[EMIT] No shoemaker found');
          // TODO: Update socket gateway
          // socket &&
          //   tripCheck.status === StatusEnum.SEARCHING &&
          //   socket.emit('find-closest-shoemakers', {
          //     type: 'not-found',
          //     message: 'No shoemaker found',
          //     tripId: trip.id,
          //   });
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
      if (isSchedule && shoemakerAccepted) {
        const currentJob = await this.queue.getJob(job.id);
        if (!currentJob) {
          return false;
        }
        console.log('Thêm queue chờ gửi thông báo');
        const delayTime = Math.max(trip.scheduleTime - dayjs().tz().valueOf() - 15 * 60 * 1000, 0);
        console.log('🚀 ~ TripConsumer ~ processFindClosestShoemakers ~ delayTime:', delayTime);
        const jobIdNotice = `CUSTOMERS_TRIP_SEND_NOTICE-${trip.id}`;
        await this.queue.add(
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
        // TODO: Update socket gateway
        // const shoemakerSocket = await this.gateWaysService.getSocket(userId);

        // if (!shoemakerSocket) return;
        this.logger.log(`ttl: ${ttl}`);
        await new Promise(async (resolve) => {
          console.log('Chạy promiseeeeeee');

          // responseListener wait shoemaker socket
          const responseListener = async (data) => {
            console.log('🚀 ~ TripConsumer ~ responseListener ~ data:', data);
            // Check if the jobId still exists
            const currentTrip = await this.tripRepository.findOne({
              where: { id: tripId },
              select: {
                status: true,
                id: true,
              },
            });
            if (currentTrip.status != StatusEnum.SEARCHING) {
              // Notify the previous shoemaker that the trip has been canceled
              if (currentTrip.status == StatusEnum.CUSTOMER_CANCEL) {
                // TODO: Update socket gateway
                // shoemakerSocket &&
                //   shoemakerSocket.emit('trip-update', {
                //     type: 'customer-cancel',
                //     message: 'Trip has been canceled by the customer. You can now accept new trips.',
                //     tripId,
                //   });
              } else if (currentTrip.status == StatusEnum.ACCEPTED) {
                // TODO: Update socket gateway
                // shoemakerSocket &&
                //   shoemakerSocket.emit('trip-update', {
                //     type: 'timeout',
                //     message: 'Trip has been sent to another shoemaker due to no response',
                //   });
              }
              // TODO: Update socket gateway
              // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener); // Remove the event listener
              return; // Exit the function to ensure nothing else is executed
            } else {
              // If the shoemaker accepted, resolve the promise with the shoemaker
              if (data.accepted) {
                // TODO: Update socket gateway
                // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener); // Remove the event listener

                await this.tripRepository.update(tripId, {
                  status: StatusEnum.ACCEPTED,
                  shoemakerId: userId,
                });

                // TODO: Update socket gateway
                // const socket = await this.gateWaysService.getSocket(customerId);
                // socket &&
                //   socket.emit('find-closest-shoemakers', {
                //     type: 'success',
                //     data: {
                //       fullName: shoemaker?.fullName,
                //       time: shoemaker?.time,
                //       phone: shoemaker?.phone,
                //       avatar: shoemaker?.avatar,
                //       id: shoemaker?.id,
                //       lat: shoemaker?.latitude,
                //       lng: shoemaker?.longitude,
                //     },
                //   });

                // Update the shoemaker status to isTrip
                await this.shoemakerRepository.update(shoemaker.id, {
                  isTrip: true,
                });
                // Create notification for the customer
                await this.notificationRepository.save({
                  customerId,
                  title: 'Đặt hàng thành công',
                  content: `Bạn đã đặt hàng thành công đơn hàng ${orderId}. Thời gian dự kiến thợ đánh giày đến là ${Math.round(shoemaker.time)} phút.`,
                });

                if (customerFcmToken) {
                  this.firebaseService
                    .send({
                      title: 'TAKER',
                      body: `Bạn đã đặt hàng thành công đơn hàng ${orderId}. Thời gian dự kiến thợ đánh giày đến là ${Math.round(shoemaker.time)} phút.`,
                      token: customerFcmToken,
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

                // Join the customer to the shoemaker room to receive updates if trip not schedule
                if (!scheduleTime) {
                  // TODO: Update socket gateway
                  // socket && socket.join(shoemaker.id);
                } else {
                  // Add queue send notification if trip schedule
                  console.log('Thêm queue chờ gửi thông báo');
                  const delayTime = Math.max(+scheduleTime - dayjs().tz().valueOf() - 15 * 60 * 1000, 0);
                  console.log('🚀 ~ TripConsumer ~ processFindClosestShoemakers ~ delayTime:', delayTime);
                  const jobIdNotice = `CUSTOMERS_TRIP_SEND_NOTICE-${trip.id}`;
                  await this.queue.add(
                    'trip-schedule',
                    { tripId: trip.id, userId, statusSchedule: StatusScheduleShoemaker.sendNotification },
                    {
                      delay: 30 * 1000,
                      // delay: delayTime,
                      jobId: jobIdNotice,
                      removeOnComplete: true,
                    },
                  );
                }

                try {
                  const job = await this.queue.getJob(jobId);
                  if (job && (await job.isActive())) {
                    await job.moveToCompleted('Canceled by customer', true);
                  } else if (job) {
                    await job.remove();
                  }
                } catch (error) {
                  console.log('🚀 ~ TripConsumer ~ responseListener ~ error:773', error);
                }
              } else {
                this.logger.log(`Send request to shoemaker`);
                // If the shoemaker declined, resolve the promise with null
                this.eventEmitter.emit('shoemaker-cancelation', {
                  tripId,
                  shoemakerId: userId,
                });
                // TODO: Update socket gateway
                // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener); // Remove the event listener
              }
            }
          };
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
          // TODO: Update socket gateway
          // if (shoemakerSocket.id) {
          //   setTimeout(() => {
          //     shoemakerSocket.emit('shoemaker-request-trip', {
          //       fullName: customerFullName,
          //       phone: customerPhone,
          //       avatar: customerAvatar,
          //       location: trip.address,
          //       tripId: trip.id,
          //       time: shoemaker.time,
          //       latitude: trip.latitude,
          //       longitude: trip.longitude,
          //       services: trip.services.map(({ price, discount, name, discountPrice, quantity }) => ({
          //         price,
          //         discount,
          //         name,
          //         discountPrice,
          //         quantity,
          //       })),
          //       totalPrice: trip.totalPrice,
          //       paymentMethod: trip.paymentMethod,
          //       addressNote: trip.addressNote,
          //       distance: shoemaker.distance,
          //       scheduleTime: +scheduleTime,
          //     });
          //   }, 2000);
          // }

          // TODO: Update socket gateway
          // shoemakerSocket && shoemakerSocket.on('shoemaker-response-trip', responseListener);
          setTimeout(() => {
            // Remove the event listener to reduce memory usage
            // TODO: Update socket gateway
            // shoemakerSocket && shoemakerSocket.off('shoemaker-response-trip', responseListener);
            resolve(null);
          }, ttl * 1000);
        });
      }
    } catch (error) {
      console.log('🚀 ~ TripConsumer ~ handleShoemakerCheckTripPendingListener ~ error:', error);
      this.logger.error(error);
    }
  }
}
