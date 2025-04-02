import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Render,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { ListenerStatus, Protocol } from './enums/listener.enum';
import { Role, UserEntity } from '../user/entities/user.entity';
import { CreateListenerDto } from './dtos/create-listener.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorizationService } from './providers/authorization.service';
import { ListenerOperationsService } from './providers/listener-operations.service';
import * as fs from 'node:fs';
import { ListenerResponseDto } from './dtos/listener-details.dto';
import { instanceToPlain, plainToClass } from 'class-transformer';

@Controller('listeners')
@Auth(AuthType.Cookie)
export class ListenerController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthorizationService,
    private readonly listenerService: ListenerOperationsService,
  ) {}

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
        });
      }

      const listeners = await this.listenerService.findAllForUser(
        activeUser.sub,
      );

      res.render('listeners/index', {
        layout: 'main.layout',
        title: 'Listeners Management',
        Protocol,
        listeners,
        ListenerStatus,
      });
    } catch (error) {
      res.redirect('/');
    }
  }

  @Post()
  public async createListener(
    @Body() createListenerDto: CreateListenerDto,
    @ActiveUser() activeUser: ActiveUserData,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      // Validate user exists
      const user = await this.userRepository.findOneBy({ id: activeUser.sub });
      if (!user) {
        // Clear invalid credentials and redirect
        res.clearCookie('jwt', {
          path: '/',
          domain: process.env.JWT_TOKEN_ISSUER,
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'strict',
        });
        return res.redirect('/auth/login');
      }
      if (createListenerDto.protocol === Protocol.HTTPS) {
        if (
          !createListenerDto.options?.ssl?.keyPath ||
          !createListenerDto.options?.ssl?.certPath
        ) {
          // req.flash('error', 'SSL key and certificate are required for HTTPS');
          return res.redirect('/listeners');
        }

        // Add file existence check
        if (!fs.existsSync(createListenerDto.options.ssl.keyPath)) {
          // req.flash('error', 'SSL key file not found');
          return res.redirect('/listeners');
        }
      }

      // Create listener and handle result
      const listener = await this.listenerService.createListener(
        createListenerDto,
        user,
      );

      return res.redirect('/listeners');
    } catch (error) {
      console.error('Listener creation failed:', error);

      // Handle specific error cases
      const errorMessage =
        error instanceof ConflictException
          ? error.message
          : 'Failed to create listener';

      return res.redirect('/listeners');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteListener(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    const listener = await this.listenerService.findOneByIdForUser(
      id,
      user.sub,
    );
    if (!listener) {
      throw new NotFoundException('Listener not found');
    }
    this.authService.checkListenerOwnership(listener, user.sub, user.role);
    await this.listenerService.deleteListener(id, user.sub, user.role);
  }

  @Get(':id')
  public async getDetailsForListener(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
    @Res() res: Response,
  ) {
    try {
      const listener = await this.listenerService.findOneByIdForUser(
        id,
        user.sub,
      );

      if (!listener) {
        throw new NotFoundException('Listener not found');
      }

      this.authService.checkListenerOwnership(listener, user.sub, user.role);

      // Transform data
      const plainData = instanceToPlain(listener);
      const listenerDto = plainToClass(ListenerResponseDto, plainData, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });
      const templateData = instanceToPlain(listenerDto);

      // Explicitly render template with full control
      return res.render('listeners/details', {
        listener: templateData,
        ListenerStatus: ListenerStatus,
      });
    } catch (error) {
      // Handle errors appropriately
      if (error instanceof NotFoundException) {
        return res.redirect('/listeners?error=not_found');
      }
      return res.redirect(`/listeners?error=server_error`);
    }
  }

  @Get(':id/start')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async remoteStartListener(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    // Find previous created listener
    const listener = await this.listenerService.findOneByIdForUser(
      id,
      user.sub,
    );
    if (!listener) {
      throw new NotFoundException('Listener or User not found');
    }

    // Startup listener service
    await this.listenerService.startListener(listener);
  }

  @Get(':id/stop')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async remoteStopListener(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    // Find previous created listener
    const listener = await this.listenerService.findOneByIdForUser(
      id,
      user.sub,
    );
    if (!listener) {
      throw new NotFoundException('Listener or User not found');
    }

    // Startup listener service
    await this.listenerService.stopListener(listener.port);
  }
}
