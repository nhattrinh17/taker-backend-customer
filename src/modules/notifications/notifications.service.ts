import { DEFAULT_MESSAGES } from '@common/constants';
import { Notification } from '@entities/notification.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListNotificationDto } from './dto/list-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Function to get all notifications of a customer
   * @param userId string
   * @param dto ListNotificationDto
   * @returns { notifications: Notification[], total: number }
   */
  async index(
    userId: string,
    { take, skip }: ListNotificationDto,
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const notifications = await this.notificationRepository.find({
        select: ['id', 'title', 'content', 'data', 'isRead', 'createdAt'],
        where: { customerId: userId },
        take,
        skip,
        order: { createdAt: 'DESC' },
      });

      const total = await this.notificationRepository.count({
        where: { customerId: userId, isRead: false },
      });

      return { notifications, total };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Function to mark a notification as read
   * @param userId string
   * @param notificationId string
   * @returns string
   */
  async markAsRead(userId: string, notificationId: string): Promise<string> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId, customerId: userId },
      });

      if (!notification) {
        throw new BadRequestException('Notification not found');
      }

      await this.notificationRepository.update(notificationId, {
        isRead: !notification.isRead,
      });

      return DEFAULT_MESSAGES.SUCCESS;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
