import { Module } from '@nestjs/common';
import { BonusPointService } from './bonus_point.service';
import { BonusPointController } from './bonus_point.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonusPoint, PointToProduct, Wallet } from '@entities/index';
import { BonusPointRepository } from 'src/database/repository/bonusPoint.repository';
import { PointToProductRepository } from 'src/database/repository/pointToProduct.repository';
import { WalletRepository } from 'src/database/repository/wallet.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BonusPoint, PointToProduct, Wallet])],
  controllers: [BonusPointController],
  providers: [
    BonusPointService,
    {
      provide: 'BonusPointRepositoryInterface',
      useClass: BonusPointRepository,
    },
    {
      provide: 'PointToProductRepositoryInterface',
      useClass: PointToProductRepository,
    },
    {
      provide: 'WalletRepositoryInterface',
      useClass: WalletRepository,
    },
  ],
  exports: [
    BonusPointService,
    {
      provide: 'BonusPointRepositoryInterface',
      useClass: BonusPointRepository,
    },
    {
      provide: 'PointToProductRepositoryInterface',
      useClass: PointToProductRepository,
    },
    {
      provide: 'WalletRepositoryInterface',
      useClass: WalletRepository,
    },
  ],
})
export class BonusPointModule {}
