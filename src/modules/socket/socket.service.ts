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

  async sendMessageToRoom(dto: SendMessageToRoom, retries = 3) {
    try {
      const url = `${process.env.SOCKET_URL}/send-message`;

      const res = await this.httpService.axiosRef
        .post(url, dto, {
          auth: {
            username: process.env.SOCKET_USERNAME,
            password: process.env.SOCKET_PASSWORD,
          },
        })
        .then((res) => {
          console.log('🚀 ~ SocketService ~ .then ~ res.data:', res.data);
          if (res.data) return res.data;
        })
        .catch((err) => {
          console.error('[API CUSTOMER TO SOCKET],', err);
          setTimeout(() => this.sendMessageToRoom(dto, retries - 1), 1000);
        });
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
