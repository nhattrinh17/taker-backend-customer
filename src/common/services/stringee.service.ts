import * as jwt from 'jsonwebtoken';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export type StringeeRequestProps = {
  toNumber: string;
  otp: number | string;
  fromNumber?: string;
};

@Injectable()
export class StringeeService {
  private readonly logger = new Logger(StringeeService.name);

  constructor(private readonly configService: ConfigService) {}

  private generateAccessToken(): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;

    const header = {
      typ: 'JWT',
      alg: 'HS256',
      cty: 'stringee-api;v=1',
    };

    const payload = {
      jti: `${this.configService.get<string>('STRINGEE_SID')}-${now}`, // JWT ID
      iss: this.configService.get<string>('STRINGEE_SID'), // API key sid
      exp: exp,
      rest_api: true,
    };

    const accessToken = jwt.sign(payload, process.env.STRINGEE_KEY, {
      algorithm: 'HS256',
      header: header,
    });

    return accessToken;
  }

  async makeCall({ toNumber, otp, fromNumber }: StringeeRequestProps) {
    try {
      const requestData = {
        from: {
          type: 'external',
          number: fromNumber || this.configService.get<string>('STRINGEE_NUMBER'),
          alias: fromNumber || this.configService.get<string>('STRINGEE_NUMBER'),
        },
        to: [
          {
            type: 'external',
            number: toNumber,
            alias: toNumber,
          },
        ],
        actions: [
          {
            action: 'talk',
            text: `Xin chào, mã xác thực của bạn là. ${otp}. Xin nhắc lại. ${otp}`,
            voice: 'female',
            speed: 0,
          },
        ],
      };

      const accessToken = this.generateAccessToken();
      this.logger.log(`Stringee service request data: ${JSON.stringify(requestData)}`);
      const res = await axios.post(
        'https://api.stringee.com/v1/call2/callout',
        { ...requestData },
        {
          headers: {
            'X-STRINGEE-AUTH': accessToken,
            'Content-Type': 'application/json',
          },
        },
      );
      return res;
    } catch (error) {
      this.logger.error('Error making call via Stringee', error);
      throw error;
    }
  }
}
