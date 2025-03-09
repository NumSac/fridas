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
  @Auth(AuthType.None)
  loginPage(@Query() error: string, @Res() res: Response) {
    return res.render('auth/login', { layout: 'layouts/auth.hbs', title: 'Login', error: error || null });
  }

  @Post('web-login')
  @Auth(AuthType.None)
  async webLogin(
    @Body() loginDto: LoginDto,
    @Res() res: Response
  ) {
    try {
      const token = await this.authService.webLogin(loginDto);

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
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