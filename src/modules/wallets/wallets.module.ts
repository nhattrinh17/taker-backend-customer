import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

import { FirebaseService } from '@common/services/firebase.service';
import { Customer, Notification, Transaction, Wallet } from '@entities/index';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Customer, Transaction, Notification]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService, FirebaseService],
})
export class WalletsModule {}
