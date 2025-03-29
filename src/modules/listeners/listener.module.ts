import { Module } from '@nestjs/common';
import { ListenerServiceProvider } from './providers/listener-service.provider';
import { ListenerService } from './providers/listener.service';
import { ListenerController } from './listener.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListenerEntity } from './entities/listener.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpListenerProvider } from './providers/http-listener.provider';
import { HttpsListenerProvider } from './providers/https-listener.provider';
import { TcpListenerProvider } from './providers/tcp-listener.provider';
import { WebsocketListenerProvider } from './providers/websocket-listener.provider';
import { AuthModule } from '../auth/auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ListenerEntity]), EventEmitterModule.forRoot()],
  providers: [ListenerService, ListenerServiceProvider, HttpListenerProvider, HttpsListenerProvider, TcpListenerProvider, WebsocketListenerProvider],
  controllers: [ListenerController],
  exports: [ListenerService, ListenerServiceProvider],
})
export class ListenerModule {}

