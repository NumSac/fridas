import { ListenerEntity } from '../entities/listener.entity';
import { Server as HttpServer } from 'http';
import { Server } from 'net';
import { WebSocketServer } from 'ws';

export interface IListenerInterface {
  create(
    port: number,
    listener: ListenerEntity,
  ): Promise<
    HttpServer | Server | { httpServer: Server; wss: WebSocketServer }
  >;

  close(port: number): Promise<void>;
}
