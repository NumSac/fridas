import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';


/*
*
* This is should later be integrated with the main authentication guard.
* Just a quick implementation
*
* */
@Injectable()
export class CookieAuthenticatedGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    try {
      const token = request.cookies?.jwt;
      if (!token) throw new Error('No token found');

      const payload = await this.jwtService.verifyAsync(token);
      request.user = token.user;
      return true;
    } catch (e) {
      response.redirect('/auth/login');
      return false;
    }
  }
}