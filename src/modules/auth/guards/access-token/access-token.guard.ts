// auth/guards/access-token.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ConfigType } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import jwtConfig from '../../../../config/jwt.config';
import { REQUEST_USER_KEY } from '../../constants/auth.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    try {
      // Try both authentication methods
      const token = this.extractTokenFromHeader(request) ||
        this.extractTokenFromCookie(request);

      if (!token) {
        throw new UnauthorizedException('No authentication token found');
      }

      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      request[REQUEST_USER_KEY] = payload;
      return true;
    } catch (error) {
      // Handle cookie cleanup and redirect for browser-based auth
      if (this.hasAuthCookie(request)) {
        this.clearAuthCookie(response);
        response.redirect('/auth/login');
        return false;
      }

      // For API requests, throw normally
      throw new UnauthorizedException(error.message);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.jwt;
  }

  private hasAuthCookie(request: Request): boolean {
    return !!request.cookies?.jwt;
  }

  clearAuthCookie(response: Response): void {
    response.clearCookie('jwt', {
      path: '/',
      domain: this.configService.get('jwt.issuer'),
      secure: this.configService.get('jwt.secret'),
    });
  }
}