import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './provider/auth.service';
import { LoginDto } from './dtos/login.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { CookieAuthenticatedGuard } from './guards/cookie-authentication/cookie-authentication.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('login')
  loginPage(@Query() error: string, @Res() res: Response) {
    return res.render('auth/login', { layout: 'layouts/auth.hbs', title: 'Login', error: error || null });
  }

  @Post('web-login')
  async webLogin(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { accessToken } = await this.authService.webLogin(loginDto);

      res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed from 'strict'
        maxAge: 3600000, // 1 hour in milliseconds
        path: '/',
        domain: process.env.COOKIE_DOMAIN || 'localhost'
      });

      return res.redirect('/');
    } catch (error) {
      return res.redirect('/auth/login?error=invalid_credentials');
    }
  }

  @Get('logout')
  @UseGuards(CookieAuthenticatedGuard)
  logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.redirect('/auth/login');
  }
}