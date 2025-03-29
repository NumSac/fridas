import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { ListenerService } from './providers/listener.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { ListenerStatus, Protocol } from './enums/listener.enum';
import { Role } from '../user/entities/user.entity';

@Controller('listeners')
@Auth(AuthType.Cookie)
export class ListenerController {
  constructor(
    private readonly listenerService: ListenerService,
  ) {
  }

  @Get()
  async getListeners(
    @ActiveUser() activeUser: ActiveUserData,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (activeUser.role === Role.ADMIN) {
        const listeners = await this.listenerService.findAll();

        return res.render('listeners/index', {
          layout: 'main.layout',
          title: 'Admin Listeners Management',
          Protocol,
          listeners,
          ListenerStatus,
          // messages: req.flash(),
        });
      }

      const listeners = await this.listenerService.findAllForUser(activeUser.sub);

      res.render('listeners/index', {
        layout: 'main.layout',
        title: 'Listeners Management',
        Protocol,
        listeners,
        ListenerStatus,
        // messages: req.flash(), // If using flash messages
      });
    } catch (error) {
      // req.flash('error', 'Failed to load listeners');
      res.redirect('/');
    }
  }
}