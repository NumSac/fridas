import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './provider/auth.service';
import { LoginDto } from './dtos/login.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';

@Controller('auth')
@Auth(AuthType.None)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('login')
  loginPage(@Query() error: string, @Res() res: Response) {
    return res.render('auth/login', { layout: 'layouts/auth.pug', title: 'Login', error: error || null });
  }

  @Post('login')
  async webLogin(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { accessToken } = await this.authService.signIn(loginDto);

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

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.redirect('/auth/login');
  }
}