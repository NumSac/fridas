import { Controller, Get, Res } from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { ListenerService } from './providers/listener.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { Role } from '../user/entities/user.entity';
import { ListenerStatus } from './enums/listener.enum';
import { request } from 'express';


@Controller('listeners')
@Auth(AuthType.Cookie)
export class ListenerController {
  constructor(
    private listenerService: ListenerService,
  ) {
  }

  @Get()
  async getListeners(
    @ActiveUser() activeUser: ActiveUserData,
    @Res() res: Response,
  ) {
    let listeners;
    if (activeUser.role === Role.ADMIN) {
      listeners = await this.listenerService.findAll();

      return {
        title: 'Listeners',
        listeners,
        ListenerStatus,
        // messages: request.flash(), // If using flash messages
        user: activeUser, // Pass user data if needed in template
      };
    }
    listeners = await this.listenerService.findAllForUser(activeUser.sub);

    res.render('listeners/index.pug', {
      title: 'Listeners',
      listeners,
      ListenerStatus,
      // messages: request.flash(), // If using flash messages
      user: activeUser, // Pass user data if needed in template
    });
  }
}


