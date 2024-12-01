import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const forwardedIps = request.headers['x-forwarded-for'] as string;
    const realIp = request.headers['x-real-ip'] as string;
    const cfConnectingIp = request.headers['cf-connecting-ip'] as string;
    const ips = forwardedIps ? forwardedIps.split(',') : [];
    return realIp || cfConnectingIp || ips[0] || null;
  },
);
