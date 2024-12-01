import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class Helper {
  async hashString(str: string): Promise<string> {
    const salt = randomBytes(32);
    const hashedStr = await argon2.hash(str, { salt });
    return hashedStr;
  }

  async verifyHash(hashStr: string, str: string): Promise<boolean> {
    return argon2.verify(hashStr, str);
  }

  queryStringToObject(queryString: string): object {
    return queryString
      ? JSON.parse('{"' + queryString.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function (key, value) {
          return key === '' ? value : decodeURIComponent(value);
        })
      : null;
  }
}
