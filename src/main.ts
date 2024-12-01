import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import fastifyCsrf from '@fastify/csrf-protection';
import helmet from 'helmet';
import { AppModule } from './app.module';
// import morgan from 'morgan';
import { Cluster } from './cluster';
import { processENV, validateEnvironmentVars } from './config/configuration';
import { HttpExceptionFilter } from './filters/bad-request.filter';
import { setupSwagger } from './setup-swagger';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import fastyfyMultipart from '@fastify/multipart';
import { ServiceAccount } from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { cors: true });
  const configService = app.get(ConfigService);
  validateEnvironmentVars();
  // app.enable('trust proxy');// only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  app.use(helmet());
  // app.setGlobalPrefix('/api'); //use api as global prefix if you don't have subdomain

  app.register(fastyfyMultipart as any, {
    limits: {
      fileSize: 50 * 1024 * 1024, // Giới hạn kích thước tệp là 100MB
    },
  });
  // app.register(fastifyCors, {
  //   credentials: true,
  //   origin: `https://${configService.get<string>('DOMAIN')}`,
  // });

  // app.register(fastifyCsrf, { cookieOpts: { signed: true } } as any);

  app.enableVersioning();
  // const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    // new ClassSerializerInterceptor(reflector),
    new TransformInterceptor(),
  );

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      // dismissDefaultMessages: true,
      // exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  const adminConfig: ServiceAccount = {
    projectId: configService.get('FIREBASE_PROJECT_ID'),
    privateKey: configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
  });
  admin.messaging();

  // if (!configService.isDevelopment) {
  app.enableShutdownHooks();
  // }
  processENV().enableDocumentation && setupSwagger(app);
  await app.listen(processENV().server.port, '0.0.0.0');

  console.info(`server running on ${await app.getUrl()}`);
}
Cluster.createCluster(bootstrap);
