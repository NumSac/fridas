import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CookieAuthenticatedGuard implements CanActivate {
  private readonly logger = new Logger(CookieAuthenticatedGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    try {
      // 1. Get token from cookies
      const token = request.cookies?.jwt;
      if (!token) {
        throw new Error('No JWT cookie found');
      }

      // 2. Verify token with configuration
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.secret'),
        audience: this.configService.get('jwt.audience'),
        issuer: this.configService.get('jwt.issuer'),
      });

      // 3. Attach user to request
      request.user = payload; // Use payload instead of token.user
      this.logger.debug(`Authenticated user ${payload.sub}`);

      return true;
    } catch (error) {
      // 4. Handle errors properly
      this.logger.error('Authentication failed', error.stack);

      // 5. Clear invalid cookie
      response.clearCookie('jwt', {
        path: '/',
        domain: this.configService.get('cookie.domain'),
      });

      // 6. Redirect to login
      response.redirect('/auth/login');
      return false;
    }
  }
}