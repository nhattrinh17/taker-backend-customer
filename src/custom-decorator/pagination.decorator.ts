import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PaginationDto {
  page: number;
  limit: number;
  offset: number;
}

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const pagination = {
      page: 1,
      limit: 10,
      offset: 0,
    };
    const page = request.query?.page as string;
    const limit = request.query?.limit as string;
    const p = parseInt(page);
    const l = parseInt(limit) || 200;
    if (typeof p == 'number' && typeof l == 'number' && p >= 1 && l >= 1) {
      pagination.page = p;
      pagination.limit = l > 200 ? 200 : l;
      pagination.offset = l * (p - 1);
    }
    return pagination;
  },
);
