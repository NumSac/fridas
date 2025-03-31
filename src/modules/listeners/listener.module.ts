import { Module } from '@nestjs/common';
import { ListenerServiceProvider } from './providers/listener-service.provider';
import { ListenerController } from './listener.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListenerEntity } from './entities/listener.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpListenerProvider } from './providers/http-listener.provider';
import { HttpsListenerProvider } from './providers/https-listener.provider';
import { TcpListenerProvider } from './providers/tcp-listener.provider';
import { WebsocketListenerProvider } from './providers/websocket-listener.provider';
import { UserModule } from '../user/user.module';
import { AuthorizationService } from './providers/authorization.service';
import { ListenerOperationsService } from './providers/listener-operations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListenerEntity]),
    EventEmitterModule.forRoot(),
    UserModule,
  ],
  providers: [
    AuthorizationService,
    ListenerOperationsService,
    ListenerServiceProvider,
    HttpListenerProvider,
    HttpsListenerProvider,
    TcpListenerProvider,
    WebsocketListenerProvider,
  ],
  controllers: [ListenerController],
  exports: [ListenerOperationsService],
})
export class ListenerModule {}
