import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
// import * as Sentry from '@sentry/node';
import { Queue } from 'bull';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { DataSource, In, Repository } from 'typeorm';

import {
  DEFAULT_MESSAGES,
  EventEmitSocket,
  PaymentEnum,
  PaymentStatusEnum,
  QUEUE_NAMES,
  RoomNameAdmin,
  SOCKET_PREFIX,
  ShareType,
  StatusEnum,
  StatusScheduleShoemaker,
  TransactionSource,
  TransactionStatus,
  TransactionType,
  createPaymentUrl,
  orderId as generateOrderId,
  refund,
} from '@common/index';
import { Customer, Notification, RatingSummary, Service, Shoemaker, Transaction, Trip, TripCancellation, TripRating, Wallet, WalletLog } from '@entities/index';
// import { GatewaysService } from '@gateways/gateways.service';

import { CUSTOMERS, NOTIFICATIONS_SCREEN, SHOEMAKER } from '@common/constants/notifications.constant';
import { FirebaseService } from '@common/services/firebase.service';
import { CancelTripDto, CreateTripDto, RateTripDto } from './dto';
import RedisService from '@common/services/redis.service';
import { SocketService } from '@modules/socket/socket.service';
import { BullQueueService } from '@modules/bullQueue/bullQueue.service';
import { TripServiceRepositoryInterface } from 'src/database/interface/tripService.interface';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip) private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Shoemaker)
    private readonly shoemakerRepository: Repository<Shoemaker>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(TripCancellation)
    private readonly tripCancellationRepository: Repository<TripCancellation>,
    @InjectRepository(TripRating)
    private readonly tripRatingRepository: Repository<TripRating>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(RatingSummary)
    private readonly ratingSummaryRepository: Repository<RatingSummary>,
    private readonly socketService: SocketService,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly dataSource: DataSource,
    private readonly firebaseService: FirebaseService,
    private readonly redis: RedisService,
    private readonly bullQueueService: BullQueueService,
    @Inject('TripServiceRepositoryInterface')
    private readonly tripServiceRepository: TripServiceRepositoryInterface,
  ) {}

  /**
   * Function to create a trip
   * @param dto CreateTripDto
   * @param userId string
   * @returns tripId
   */
  async create(dto: CreateTripDto, userId: string, ip?: string) {
    // console.log('🚀 ~ TripsService ~ create ~ dto:', JSON.stringify(dto));
    try {
      if (dto.customerId !== userId) {
        throw new BadRequestException('Invalid customer');
      }
      const customerInfo = await this.customerRepository.findOne({
        where: { id: userId },
        select: {
          newUser: true,
          fcmToken: true,
        },
      });
      // FIXME: Check service experienceOnce(tạm thời sử sụng)
      if (!customerInfo.newUser) {
        const checkServices = await Promise.all(
          dto.services.map((service) =>
            this.serviceRepository.exists({
              where: {
                id: service.serviceId,
                experienceOnce: true,
              },
            }),
          ),
        );
        if (checkServices.includes(true)) throw new BadRequestException('Cannot use service experience once');
      }

      // If customer has one trip that is not completed and searching, throw an error
      const currentTrip = await this.tripRepository.findOneBy({
        customerId: userId,
        status: In([StatusEnum.SEARCHING, StatusEnum.ACCEPTED, StatusEnum.INPROGRESS, StatusEnum.MEETING]),
      });

      if (currentTrip) {
        throw new BadRequestException('You have a trip that is not completed');
      }

      const newTrip = new Trip();
      const { services } = dto;

      newTrip.customerId = userId;
      newTrip.latitude = dto.latitude;
      newTrip.longitude = dto.longitude;
      newTrip.paymentMethod = dto.paymentMethod;

      if (dto.address) newTrip.address = dto.address;
      if (dto.addressNote) newTrip.addressNote = dto.addressNote;
      if (dto.images) newTrip.images = dto.images;

      newTrip.totalPrice = 0;
      newTrip.services = [];
      newTrip.ipRequest = ip;
      newTrip.income = 0;

      for (const service of services) {
        const s = await this.serviceRepository.findOneBy({
          id: service.serviceId,
        });
        if (!s) throw new BadRequestException('Invalid service');
        const price = s.discountPrice || s.price;
        newTrip.totalPrice += price * service.quantity;

        // Calculate income for shoemaker
        if (s.shareType === ShareType.FIXED) {
          newTrip.income += Math.round(s.share * service.quantity);
        } else if (s.shareType === ShareType.PERCENTAGE) {
          newTrip.income += Math.round(s.share * price * service.quantity);
        }
        newTrip.services.push({
          price: s.price,
          discountPrice: s.discountPrice,
          discount: s.discount,
          serviceId: s.id,
          quantity: service.quantity,
          name: s.name,
          shareType: s.shareType,
          share: s.share,
        } as any);
      }

      // Check payment method and wallet balance
      if (dto.paymentMethod === PaymentEnum.DIGITAL_WALLET) {
        const customer = await this.customerRepository.findOne({
          where: { id: userId },
          relations: ['wallet'],
        });
        if (!customer) throw new BadRequestException('Invalid customer');
        if (customer.wallet.balance < newTrip.totalPrice) {
          throw new BadRequestException('Not enough balance');
        }
        newTrip.paymentStatus = PaymentStatusEnum.PAID;
      }
      // Calculate fee for taker system
      newTrip.fee = Math.round(newTrip.totalPrice - newTrip.income);

      // if trip is scheduled
      if (dto.scheduleTime) {
        newTrip.scheduleTime = dto.scheduleTime;
      }
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      let trip: Trip;
      try {
        trip = await queryRunner.manager.save(Trip, newTrip);

        if (dto.paymentMethod === PaymentEnum.DIGITAL_WALLET) {
          const wallet = await queryRunner.manager.findOne(Wallet, {
            where: { customerId: userId },
            lock: { mode: 'pessimistic_write' },
          });
          if (!wallet) {
            throw new Error('Wallet not found');
          }
          const currentBalance = wallet.balance;
          const newBalance = currentBalance - newTrip.totalPrice;
          await queryRunner.manager.save(Wallet, {
            id: wallet.id,
            balance: newBalance,
          });
          // Write transaction
          let orderId = generateOrderId();

          let foundTransaction = await queryRunner.manager.findOneBy(Transaction, {
            orderId,
          });

          while (foundTransaction) {
            orderId = generateOrderId();
            foundTransaction = await queryRunner.manager.findOneBy(Transaction, {
              orderId,
            });
          }

          await queryRunner.manager.save(Transaction, {
            amount: trip.totalPrice,
            transactionType: TransactionType.WITHDRAW,
            walletId: wallet.id,
            transactionDate: new Date(),
            description: `Thanh toán cho đơn hàng ${trip.orderId}`,
            transactionSource: TransactionSource.TRIP,
            tripId: trip.id,
            orderId,
            status: TransactionStatus.SUCCESS,
          });
          // Write wallet log
          await queryRunner.manager.save(WalletLog, {
            walletId: wallet.id,
            previousBalance: currentBalance,
            currentBalance: newBalance,
            amount: trip.totalPrice,
            description: `Thanh toán cho đơn hàng ${trip.orderId}`,
          });
          // Create notification for customer
          await queryRunner.manager.save(Notification, {
            customerId: userId,
            title: 'TAKER',
            content: CUSTOMERS.generateWalletMessage(trip.totalPrice, '-', trip.orderId).mes03,
            data: JSON.stringify({
              screen: NOTIFICATIONS_SCREEN.REQUEST_TRIP,
            }),
          });

          if (customerInfo.fcmToken) {
            this.firebaseService
              .send({
                token: customerInfo.fcmToken,
                title: 'TAKER',
                body: CUSTOMERS.generateWalletMessage(trip.totalPrice, '-', trip.orderId).mes03,
                data: { screen: NOTIFICATIONS_SCREEN.REQUEST_TRIP },
              })
              .catch((e) => {
                console.log('Error while sending notification', e);
              });
          }
        }
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }

      // If payment method = credit card, create payment url
      let paymentUrl = '';
      if (dto.paymentMethod === PaymentEnum.CREDIT_CARD) {
        paymentUrl = createPaymentUrl({
          amount: trip.totalPrice,
          ip,
          orderId: trip.orderId,
          orderInfo: `Thanh toan don hang ${trip.orderId}`,
        });
      }
      if (dto.scheduleTime) {
        // Update job id for trip
        const jobId = `${QUEUE_NAMES.CUSTOMERS_TRIP}-${trip.id}`;
        await this.tripRepository.update(trip.id, { jobId });
        this.bullQueueService.addQueueTrip(
          'trip-schedule',
          { tripId: trip.id, userId, statusSchedule: StatusScheduleShoemaker.findShoemaker },
          {
            removeOnComplete: true,
            jobId: jobId,
          },
        );
      }

      // Check customer and update status newUser
      if (customerInfo.newUser) {
        await this.customerRepository.update(userId, { newUser: false });
      }

      // send to admins new trips
      await this.socketService.sendMessageToRoom({
        data: {
          idTrip: trip.id,
        },
        event: EventEmitSocket.TripCreate,
        roomName: RoomNameAdmin,
      });

      const tokens = await this.redis.smembers(`${SOCKET_PREFIX}admins-fcm-token`);
      // console.log('🚀 ~ TripsService ~ create ~ tokens:', tokens);
      tokens.length &&
        (await this.firebaseService.sendToAdmin({
          body: `Đã có đơn hàng mới tại ${trip.address}`,
          title: 'Đơn hàng mới',
          tokens: tokens,
        }));

      return { tripId: trip.id, paymentUrl };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to cancel a trip of a customer
   * @param dto CancelTripDto
   * @param userId CustomerId
   * @returns Success message
   */
  async cancel(dto: CancelTripDto, userId: string) {
    try {
      const trip = await this.tripRepository.findOneBy({
        id: dto.tripId,
        customerId: userId,
      });

      if (!trip) throw new BadRequestException('Invalid trip');

      if (trip.status !== StatusEnum.SEARCHING && trip.status !== StatusEnum.ACCEPTED) {
        throw new BadRequestException('Trip status is not valid');
      }
      // Start transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.save(TripCancellation, {
          tripId: trip.id,
          customerId: userId,
          reason: dto.reason,
        });
        await queryRunner.manager.update(Trip, trip.id, {
          status: StatusEnum.CUSTOMER_CANCEL,
        });

        // If payment method = digital wallet, refund the money
        if (trip.paymentMethod === PaymentEnum.DIGITAL_WALLET) {
          const wallet = await queryRunner.manager.findOneBy(Wallet, {
            customerId: trip.customerId,
          });
          if (!wallet) throw new BadRequestException('Invalid wallet');
          const currentBalance = wallet.balance;
          const newBalance = currentBalance + trip.totalPrice;

          await queryRunner.manager.update(Wallet, wallet.id, {
            balance: newBalance,
          });

          await queryRunner.manager.update(Trip, trip.id, {
            paymentStatus: PaymentStatusEnum.REFUNDED,
          });

          // Write transaction
          let orderId = generateOrderId();

          let foundTransaction = await queryRunner.manager.findOneBy(Transaction, {
            orderId,
          });

          while (foundTransaction) {
            orderId = generateOrderId();
            foundTransaction = await queryRunner.manager.findOneBy(Transaction, {
              orderId,
            });
          }
          await queryRunner.manager.save(Transaction, {
            amount: trip.totalPrice,
            transactionType: TransactionType.DEPOSIT,
            walletId: wallet.id,
            transactionDate: new Date(),
            description: `Hoàn tiền cho đơn hàng ${trip.orderId}`,
            transactionSource: TransactionSource.TRIP,
            tripId: trip.id,
            orderId,
            status: TransactionStatus.SUCCESS,
          });

          // Write wallet log
          await queryRunner.manager.save(WalletLog, {
            walletId: wallet.id,
            previousBalance: currentBalance,
            currentBalance: newBalance,
            amount: trip.totalPrice,
            description: `Hoàn tiền cho đơn hàng ${trip.orderId}`,
          });
          // Create a notification for the customer
          await queryRunner.manager.save(Notification, {
            customerId: userId,
            title: 'TAKER',
            content: CUSTOMERS.generateWalletMessage(trip.totalPrice, '+', trip.orderId).mes02,
            data: JSON.stringify({
              screen: NOTIFICATIONS_SCREEN.WALLET,
            }),
          });
          const customer = await queryRunner.manager.findOneBy(Customer, {
            id: userId,
          });
          if (customer.fcmToken) {
            this.firebaseService
              .send({
                token: customer.fcmToken,
                title: 'TAKER',
                body: CUSTOMERS.generateWalletMessage(trip.totalPrice, '+', trip.orderId).mes02,
                data: { screen: NOTIFICATIONS_SCREEN.WALLET },
              })
              .catch((e) => {
                console.log('Error while sending notification', e);
              });
          }
        }

        await queryRunner.commitTransaction();

        if (trip.paymentMethod === PaymentEnum.CREDIT_CARD) {
          // If payment method = credit card  and paid, refund the money
          if (trip.paymentStatus === PaymentStatusEnum.PAID) {
            // Refund the money
            const data = refund(trip.orderId, trip.totalPrice, trip.ipRequest);
            console.log('Refund data', data);

            await fetch(process.env.vnp_refund_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
              .then(async (res) => {
                const r = await res.json();
                if (r.vnp_ResponseCode === '00') {
                  await this.tripRepository.update(trip.id, {
                    paymentStatus: PaymentStatusEnum.REFUNDED,
                    refundData: JSON.stringify(r),
                  });
                  // Create a notification for the customer
                  await this.notificationRepository.save({
                    customerId: userId,
                    title: 'TAKER',
                    content: CUSTOMERS.generateWalletMessage(trip.totalPrice, '+', trip.orderId).mes02,
                    data: JSON.stringify({
                      screen: NOTIFICATIONS_SCREEN.WALLET,
                    }),
                  });
                  const customer = await this.customerRepository.findOneBy({
                    id: userId,
                  });
                  if (customer.fcmToken) {
                    this.firebaseService
                      .send({
                        token: customer.fcmToken,
                        title: 'TAKER',
                        body: CUSTOMERS.generateWalletMessage(trip.totalPrice, '+', trip.orderId).mes02,
                        data: { screen: NOTIFICATIONS_SCREEN.WALLET },
                      })
                      .catch((e) => {
                        console.log('Error while sending notification', e);
                      });
                  }
                } else {
                  await this.tripRepository.update(trip.id, {
                    paymentStatus: PaymentStatusEnum.REFUNDED_FAILED,
                    refundData: JSON.stringify(r),
                  });
                }
                console.log('Refund response', r);
              })
              .catch((e) => {
                console.log('Error while refunding', e);
              });
          }
        }

        try {
          if (trip.jobId) {
            const job = await this.bullQueueService.getQueueTripById(trip.jobId);
            if (job && (await job.isActive())) {
              await job.moveToCompleted('Canceled by customer', true);
            } else if (job) {
              await job.remove();
            }
          }
        } catch (e) {
          console.log('Error while removing job', e);
        }

        if (trip.shoemakerId) {
          const shoemaker = await this.shoemakerRepository.findOneBy({
            id: trip.shoemakerId,
          });

          if (shoemaker) {
            if (trip.scheduleTime) {
              await this.shoemakerRepository.update(shoemaker.id, {
                isSchedule: false,
              });
            } else {
              await this.shoemakerRepository.update(shoemaker.id, {
                isTrip: false,
              });
            }

            // Send notification to shoemaker
            const shoemakerSocketId = await this.socketService.getSocketIdByUserId(shoemaker.id);
            if (shoemakerSocketId) {
              this.socketService.sendMessageToRoom({
                data: {
                  type: trip.scheduleTime ? 'customer-cancel-schedule' : 'customer-cancel',
                  message: 'Trip has been canceled by the customer. You can now accept new trips.',
                },
                event: 'trip-update',
                roomName: shoemakerSocketId,
              });
            }
            const socketCustomerId = await this.socketService.getSocketIdByUserId(userId);
            // Leave the room and prevent the customer from receiving updates
            if (socketCustomerId) {
              this.bullQueueService.addQueueLeaveRoom('leave-room-websocket', {
                roomName: shoemaker.id,
                socketId: socketCustomerId,
              });
            }
          }
        }

        // send to admin remove trip
        this.socketService.sendMessageToRoom({
          data: {
            idTrip: trip.id,
          },
          event: EventEmitSocket.TripCancel,
          roomName: RoomNameAdmin,
        });

        // Check fist booking trip
        const hasExperienceOnceService = await this.tripServiceRepository.checkTripHasServiceExperienceOnce(trip.id);
        if (hasExperienceOnceService) {
          await this.customerRepository.update(userId, { newUser: true });
        }
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }

      return DEFAULT_MESSAGES.SUCCESS;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to rate a trip of a customer
   * @param dto RateTripDto
   * @param userId CustomerId
   * @returns Success message
   */
  async rate(dto: RateTripDto, userId: string) {
    try {
      const trip = await this.tripRepository.findOneBy({
        id: dto.tripId,
        customerId: userId,
      });
      if (!trip) throw new BadRequestException('Invalid trip');

      const shoemaker = await this.shoemakerRepository.findOneBy({
        id: dto.shoemakerId,
      });
      if (!shoemaker) throw new BadRequestException('Invalid shoemaker');

      if (trip.status !== StatusEnum.COMPLETED) {
        throw new BadRequestException('Trip status is not valid');
      }

      const tripRating = await this.tripRatingRepository.findOneBy({
        tripId: trip.id,
        customerId: userId,
      });
      if (tripRating) throw new BadRequestException('You have rated this trip');

      await this.tripRatingRepository.save({ ...dto, customerId: userId });
      // Update rating average for shoemaker
      const summary = await this.ratingSummaryRepository.findOneBy({
        shoemakerId: shoemaker.id,
      });
      if (!summary) {
        await this.ratingSummaryRepository.save({
          shoemakerId: shoemaker.id,
          average: dto.rating,
          count: 1,
        });
      } else {
        const newAverage = (summary.average * summary.count + dto.rating) / (summary.count + 1);
        await this.ratingSummaryRepository.update(summary.id, {
          average: newAverage,
          count: summary.count + 1,
        });
      }
      // Create notification for shoemaker when customer rate
      // TODO: send notification to shoemaker with using firebase
      try {
        const randomIndex = Math.floor(Math.random() * SHOEMAKER.RATING.length);
        const randomContent = SHOEMAKER.RATING[randomIndex];

        await this.notificationRepository.save({
          shoemakerId: trip.shoemakerId,
          title: randomContent,
          content: `Đơn hàng #${trip.orderId} vừa được đánh giá ${dto.rating} sao. Hãy kiểm tra ngay`,
          data: JSON.stringify({ tripId: trip.id }),
        });

        shoemaker.fcmToken &&
          this.firebaseService
            .send({
              token: shoemaker.fcmToken,
              title: 'TAKER',
              body: randomContent,
              data: { screen: NOTIFICATIONS_SCREEN.RATING, tripId: trip.id },
            })
            .catch((e) => {
              console.log('Error while sending notification', e);
            });
      } catch (error) {}
      return DEFAULT_MESSAGES.SUCCESS;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to get detail of a trip
   * @param userId CustomerId
   * @param tripId TripId
   * @returns Trip detail
   */
  async show(userId: string, tripId: string) {
    try {
      const trip = await this.tripRepository.findOne({
        where: {
          id: tripId,
          customerId: userId,
        },
        relations: ['services', 'rating', 'shoemaker'],
      });
      if (!trip) throw new NotFoundException('Invalid trip');

      const { rating, services, shoemaker } = trip;
      return {
        rating: {
          rating: rating?.rating,
          comment: rating?.comment,
        },
        services: services.map(({ price, discountPrice, discount, quantity, name }) => ({
          price,
          discountPrice,
          discount,
          quantity,
          name,
        })),
        shoemaker: {
          name: shoemaker?.fullName,
          phone: shoemaker?.phone,
          avatar: shoemaker?.avatar,
        },
        orderId: trip.orderId,
        totalPrice: trip.totalPrice,
        images: trip.images,
        receiveImages: trip.receiveImages,
        completeImages: trip.completeImages,
        paymentMethod: trip.paymentMethod,
        paymentStatus: trip.paymentStatus,
        scheduleTime: trip.scheduleTime,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to get payment status of a trip
   * @param userId CustomerId
   * @param tripId TripId
   * @returns Trip status
   */
  async getPaymentStatus(userId: string, tripId: string) {
    try {
      const trip = await this.tripRepository.findOne({
        where: {
          id: tripId,
          customerId: userId,
        },
      });
      if (!trip) throw new NotFoundException('Invalid trip');
      return trip.paymentStatus;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
