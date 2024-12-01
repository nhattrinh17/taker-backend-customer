import { Customer, Device, Option } from '@entities/index';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy } from './jwt.strategy';

import { SmsService, StringeeService } from '@common/index';
import { DeviceRepository } from 'src/database/repository/device.repository';
import { BonusPointModule } from '@modules/bonus_point/bonus_point.module';

@Module({
  imports: [
    BonusPointModule,
    TypeOrmModule.forFeature([Customer, Option, Device]),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    StringeeService,
    JwtStrategy,
    SmsService,
    {
      provide: 'DeviceRepositoryInterface',
      useClass: DeviceRepository,
    },
  ],
})
export class AuthenticationModule {}
