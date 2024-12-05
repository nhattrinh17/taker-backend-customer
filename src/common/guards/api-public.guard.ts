import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class SocketCallApiGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const basicToken: string = request.headers.authorization;
    if (basicToken && basicToken.startsWith('Basic')) {
      const decodeToken = Buffer.from(basicToken.split(' ')[1], 'base64').toString();
      const username = decodeToken.split(':')[0];
      const password = decodeToken.split(':')[1];
      if (
        //
        username === process.env.USER_API_PUBLIC &&
        password === process.env.PASSWORD_API_PUBLIC
      ) {
        return true;
      }
    }
    return false;
  }
}
