import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import moment from 'moment-timezone';
export interface DateRangeDto {
  start: string;
  end: string;
}

export const DateRange = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const dateRange = {};
    const startDate = request.query?.startDate as string;
    const endDate = request.query?.endDate as string;
    const tz = process.env.TZ;
    if (startDate)
      dateRange['start'] = moment
        .tz(startDate, tz)
        .startOf('day')
        .toISOString();
    if (endDate)
      dateRange['end'] = moment.tz(endDate, tz).endOf('day').toISOString();
    return dateRange;
  },
);
