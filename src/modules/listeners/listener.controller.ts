import { Body, Controller, Get, Res } from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { CreateListenerDto } from './dtos/create-listener.dto';

@Controller()
export class ListenerController {
  constructor() {}

  @Get()
  async getListeners(
    @Body() createListenerDto: CreateListenerDto,
    @ActiveUser() activeUser: ActiveUserData
  ) {
  }


}
