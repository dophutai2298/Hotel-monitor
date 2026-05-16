import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPublic } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPublic => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);