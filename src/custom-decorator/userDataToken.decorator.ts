import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserDataTokenDto {
  id: number;
  tenantId: string;
  email: string;
}

export const UserDataToken = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const header = request.headers.authorization;
  const token = header?.split(' ')[1]?.split('.')[1];
  if (token) {
    const decoded = atob(token);
    const dataParse = JSON.parse(decoded);
    return {
      id: dataParse?.id,
      email: dataParse?.email,
    };
  }
  return {};
});
