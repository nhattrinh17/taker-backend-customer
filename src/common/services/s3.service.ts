import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async getSignedFileUrl(key: string) {
    try {
      const command = new PutObjectCommand({
        ACL: 'public-read',
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      });
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 60 * 15,
      });

      return {
        type: 'success',
        message: 'Generate url successfully',
        data: url,
      };
    } catch (e) {
      this.logger.error('getSignedFileUrl', JSON.stringify(e));
      return { type: 'error', message: e.message };
    }
  }
}
