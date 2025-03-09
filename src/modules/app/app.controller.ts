import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { CookieAuthenticatedGuard } from '../auth/guards/cookie-authentication/cookie-authentication.guard';
import { Response } from 'express';


@Controller()
export class AppController {
  @Get()
  @UseGuards(CookieAuthenticatedGuard)
  index(@Req() req: Request, @Res() res: Response) {
    res.render('index', {
      layout: 'main.layout',
      title: 'Dashboard',
      currentYear: new Date().getFullYear(),
      appVersion: '1.0.0',
    });
  }
}
