import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { SendMessageToRoom } from './dto/create-call-socket.dto';
import RedisService from '@common/services/redis.service';
import { SOCKET_PREFIX } from '@common/constants';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
  ) {}

  async getSocketIdByUserId(userId: string): Promise<string> {
    return this.redisService.get(`${SOCKET_PREFIX}${userId}`);
  }

  async sendMessageToRoom(dto: SendMessageToRoom) {
    try {
      const url = `${process.env.SOCKET_URL}/send-message`;

      return this.httpService.axiosRef.post(url, dto, {
        auth: {
          username: process.env.SOCKET_USERNAME,
          password: process.env.SOCKET_PASSWORD,
        },
      });
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
