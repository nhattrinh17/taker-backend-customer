import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { HttpModule } from '@nestjs/axios';
import RedisService from '@common/services/redis.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [SocketService, RedisService],
  exports: [SocketService],
})
export class SocketModule {}
