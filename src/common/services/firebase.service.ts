import { INotificationPayload } from '@common/constants';
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  verifyIdToken(idToken: string) {
    return new Promise((resolve, reject) => {
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const uid = decodedToken.uid;
          resolve(uid);
        })
        .catch((e) => {
          this.logger.error(e);
          reject(e);
        });
    });
  }

  sendToAdmin({ tokens, title, body }: { tokens: string[]; title: string; body: string }) {
    const messages: admin.messaging.Message[] = tokens.map((token) => {
      return {
        data: {
          title, // Sử dụng data thay vì notification
          body,
          url: '/admin/realtime-order', // Thêm URL vào data nếu cần
        },
        token: token,
      };
    });
    return new Promise((resolve, reject) => {
      admin
        .messaging()
        .sendEach(messages)
        .then((result) => {
          this.logger.log(`Send message to admin success with tokens=${tokens}`, result);
          resolve({ tokens, title, body });
        })
        .catch((e) => {
          this.logger.error(`Send message to admin error ${e.code} with tokens=${tokens}`);
          reject(e);
        });
    });
  }

  send({ token, title, body, data = {}, sound }: INotificationPayload) {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      token,
      data,
      android: {
        notification: {
          sound: sound || 'taker.wav',
          defaultSound: false,
          channelId: 'fast_id',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: sound || 'taker.wav',
            defaultSound: false,
          },
        },
      },
    };
    return new Promise((resolve, reject) => {
      admin
        .messaging()
        .send(message)
        .then((result) => {
          this.logger.log(`Send message to device success with token=${token}`, result);
          resolve({ token, title, body, data });
        })
        .catch((e) => {
          // TODO: Need to handle token outdated
          // https://bard.google.com/chat/cd6c73cc59d0b37b
          this.logger.error(`Send message to device error ${e.code} with token=${token}`);
          reject(e);
        });
    });
  }

  sends(payloads: INotificationPayload[]) {
    const messages: admin.messaging.Message[] = payloads.map(({ title, token, body, data = {}, sound }) => ({
      notification: {
        title,
        body,
      },
      token,
      data,
      android: {
        notification: {
          sound: sound || 'taker.wav',
          defaultSound: false,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: sound || 'taker.wav',
            defaultSound: false,
          },
        },
      },
    }));
    return new Promise((resolve, reject) => {
      admin
        .messaging()
        .sendEach(messages)
        .then((result) => {
          this.logger.log('Send batch message to device success', JSON.stringify(result.responses));
          const { successCount, failureCount, responses } = result;
          this.logger.log(`Batch successfully sent ${successCount} messages, failed to send ${failureCount} messages`);
          const successPayloads: INotificationPayload[] = [];
          const failurePayloads: INotificationPayload[] = [];

          responses.forEach((response, index) => {
            if (response.success) {
              successPayloads.push(payloads[index]);
            } else {
              // TODO: Need to handle token outdated
              failurePayloads.push(payloads[index]);
            }
          });
          resolve({ successPayloads, failurePayloads });
        })
        .catch((e) => {
          this.logger.error(e);
          reject(e);
        });
    });
  }
}
