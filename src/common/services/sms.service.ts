import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export type SmsRequestProps = {
  toNumber: string;
  otp: number | string;
};

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  constructor(private readonly configService: ConfigService) {}

  async send({ toNumber, otp }: SmsRequestProps) {
    try {
      const res = await axios.post(
        'https://sms.taker.vn',
        {
          phone: toNumber,
          otp,
          key: 'c558ebAA0e4f9E3346b39a1b466401d21a6aFEfC',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`Send sms to ${toNumber} with otp ${otp}, response: ${res.data?.message}`);
      return res.data.data;
    } catch (error) {
      this.logger.error(`Send sms error ${error?.data?.error_description}`);
      return false;
    }
  }
}
