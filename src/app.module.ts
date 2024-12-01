import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from '@common/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import connectionSource, { typeOrmConfig } from './config/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthenticationModule } from '@modules/authentication/authentication.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { SearchModule } from '@modules/search/search.module';
import { TripsModule } from '@modules/trips/trips.module';
import { SearchHistoriesModule } from '@modules/search-histories/search-histories.module';
import { ServicesModule } from '@modules/services/services.module';
import { ActivitiesModule } from '@modules/activities/activities.module';
import { WalletsModule } from '@modules/wallets/wallets.module';
import { NotificationModule } from '@modules/notifications/notifications.module';
import { BonusPointModule } from '@modules/bonus_point/bonus_point.module';
import { OptionsModule } from '@modules/options/options.module';
import { BlogModule } from '@modules/blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return typeOrmConfig;
      },
      dataSourceFactory: async () => {
        const dataSource = await connectionSource.initialize();
        // console.log(
        //   '🚀 ~ dataSourceFactory: ~ dataSource.isConnected:',
        //   dataSource.isConnected,
        // );
        return dataSource;
      },
    }),
    EventEmitterModule.forRoot({ verboseMemoryLeak: true }),
    AuthenticationModule,
    ProfileModule,
    SearchModule,
    TripsModule,
    SearchHistoriesModule,
    ServicesModule,
    ActivitiesModule,
    WalletsModule,
    NotificationModule,
    BonusPointModule,
    OptionsModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {}
}
