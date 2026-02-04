import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../modules/auth/auth.service';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): JwtPayload | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    if (data && user) {
      // If a property name is provided (e.g., 'sub'), return that property
      return user[data] || user;
    }
    
    return user;
  }
);
