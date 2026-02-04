import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      // For public endpoints, still try to authenticate if token is present
      // This allows us to detect admin vs public registrations
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers?.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Token is present, try to authenticate (but don't fail if invalid)
        try {
          const result = await super.canActivate(context);
          return result as boolean;
        } catch {
          // Authentication failed, but allow public access
          return true;
        }
      }
      
      // No token, allow public access
      return true;
    }
    
    return super.canActivate(context) as Promise<boolean>;
  }
}