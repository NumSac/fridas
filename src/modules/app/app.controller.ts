import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';


@Controller()
@Auth(AuthType.Cookie)
export class AppController {
  @Get()
  index(@Req() req: Request, @Res() res: Response) {
    res.render('index', {
      layout: 'main.layout',
      title: 'Dashboard',
      currentYear: new Date().getFullYear(),
      appVersion: '1.0.0',
    });
  }
}
