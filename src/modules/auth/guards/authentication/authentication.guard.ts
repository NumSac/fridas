// auth/guards/authentication.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { AuthType } from '../../enums/auth-type.enum';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AUTH_TYPE_KEY } from '../../decorators/auth.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;
  private authTypeGuardMap: Record<AuthType, CanActivate>;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.Cookie]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]);
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    try {
      // Try all specified authentication methods
      for (const guard of guards) {
        try {
          if (await guard.canActivate(context)) {
            return true;
          }
        } catch (error) {
        }
      }

      // If no guards passed but we have a cookie, clear it
      if (request.cookies?.jwt) {
        this.accessTokenGuard.clearAuthCookie(response);
      }

      // Handle redirect for browser requests
      if (this.isBrowserRequest(request)) {
        response.redirect('/auth/login');
        return false;
      }

      // Handle API requests
      throw new UnauthorizedException('Authentication required');
    } catch (error) {
      if (this.isBrowserRequest(request)) {
        response.redirect('/auth/login');
        return false;
      }
      throw error;
    }
  }

  private isBrowserRequest(request: Request): string | boolean {
    // Check if request is likely from a browser
    return (
      request.accepts('html') ||
      !request.accepts('json') ||
      request.method === 'GET' && !request.headers['content-type']
    );
  }
}