import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '@entities/notification.entity';
import { NotificationController } from './notifications.controller';
import { NotificationService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
