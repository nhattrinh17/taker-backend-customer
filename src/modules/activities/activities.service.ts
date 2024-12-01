import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { StatusEnum } from '@common/index';
import { Trip } from '@entities/index';

import { ActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(@InjectRepository(Trip) private readonly tripRep: Repository<Trip>) {}

  /**
   * Function to get all trips that are in progress
   * @param userId string
   * @returns List of trips that are in progress
   */
  async inProgress(userId: string) {
    try {
      const trips = await this.tripRep.find({
        select: {
          id: true,
          address: true,
          status: true,
          totalPrice: true,
          paymentMethod: true,
          latitude: true,
          longitude: true,
          orderId: true,
          scheduleTime: true,
          services: {
            price: true,
            discount: true,
            quantity: true,
            name: true,
            discountPrice: true,
          },
          shoemaker: {
            fullName: true,
            avatar: true,
            id: true,
            latitude: true,
            longitude: true,
          },
        },
        where: {
          customerId: userId,
          status: In([StatusEnum.ACCEPTED, StatusEnum.INPROGRESS, StatusEnum.SEARCHING, StatusEnum.MEETING]),
        },
        relations: ['services', 'shoemaker'],
      });
      return trips;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Function to get all trips that are completed or canceled by the customer
   * @param userId string
   * @param take number
   * @param skip number
   * @returns List of trips that are completed or canceled by the customer
   */
  async histories(userId: string, { take, skip }: ActivityDto) {
    try {
      const trips = await this.tripRep.find({
        select: {
          id: true,
          address: true,
          status: true,
          totalPrice: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          orderId: true,
          scheduleTime: true,
          rating: {
            rating: true,
          },
          shoemaker: {
            id: true,
            avatar: true,
            fullName: true,
          },
        },
        where: {
          customerId: userId,
          status: In([StatusEnum.COMPLETED, StatusEnum.CUSTOMER_CANCEL]),
        },
        relations: ['rating', 'shoemaker'],
        take,
        skip,
        order: {
          createdAt: 'DESC',
        },
      });
      return trips;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
