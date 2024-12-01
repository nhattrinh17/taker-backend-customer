import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.

    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // const isProduction = process.env.APP_ID == Environment.PRODUCTION;

    if (httpStatus > 200) {
      console.log(`Error ${httpStatus}`, exception.message);
    }
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      exception: {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      },
    };
    // isProduction && delete responseBody.exception;

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  // private validationFilter(validationErrors: ValidationError[]): void {
  //   for (const validationError of validationErrors) {
  //     const children = validationError.children;

  //     if (children && !_.isEmpty(children)) {
  //       this.validationFilter(children);

  //       return;
  //     }

  //     delete validationError.children;

  //     const constraints = validationError.constraints;

  //     if (!constraints) {
  //       return;
  //     }

  //     for (const [constraintKey, constraint] of Object.entries(constraints)) {
  //       // convert default messages
  //       if (!constraint) {
  //         // convert error message to error.fields.{key} syntax for i18n translation
  //         constraints[constraintKey] = `error.fields.${_.snakeCase(
  //           constraintKey,
  //         )}`;
  //       }
  //     }
  //   }
  // }
}
