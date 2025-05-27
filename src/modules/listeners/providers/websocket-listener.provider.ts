import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { createServer, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ListenerEntity } from '../entities/listener.entity';
import { IListenerInterface } from '../interfaces/listener.interface';
import { WsEvent } from '../enums/events.enum';

@Injectable()
export class WebsocketListenerProvider
  implements OnApplicationShutdown, IListenerInterface
{
  private servers = new Map<
    number,
    { httpServer: Server; wss: WebSocketServer }
  >();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async create(
    port: number,
    listener: ListenerEntity,
  ): Promise<{ httpServer: Server; wss: WebSocketServer }> {
    return new Promise((resolve, reject) => {
      if (this.servers.has(port)) {
        return reject(new Error(`Port ${port} is already in use`));
      }

      const httpServer = createServer();
      const wss = new WebSocketServer({
        server: httpServer,
        clientTracking: true,
      });

      // Setup WebSocket connection handler
      wss.on('connection', (ws: WebSocket, request) => {
        this.eventEmitter.emit(WsEvent.CONNECTION, {
          ws,
          request,
          listener,
          timestamp: new Date(),
        });

        ws.on('message', (message) => {
          this.eventEmitter.emit(WsEvent.MESSAGE, {
            ws,
            message,
            listener,
            timestamp: new Date(),
          });
        });

        ws.on('close', () => {
          this.eventEmitter.emit(WsEvent.CLOSE, {
            ws,
            listener,
            timestamp: new Date(),
          });
        });
      });

      // Handle HTTP server errors
      httpServer.on('error', (err) => {
        this.eventEmitter.emit(WsEvent.ERROR, {
          error: err,
          listener,
          timestamp: new Date(),
        });
        reject(err);
      });

      // Start listening
      httpServer.listen(port, () => {
        this.servers.set(port, { httpServer, wss });
        resolve({ httpServer, wss });
      });
    });
  }

  async close(port: number): Promise<void> {
    return new Promise((resolve) => {
      const server = this.servers.get(port);
      if (server) {
        server.wss.close(() => {
          server.httpServer.close(() => {
            this.servers.delete(port);
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
  }

  onApplicationShutdown() {
    for (const [port] of this.servers) {
      this.close(port).catch((err) => {
        console.error(`Error closing WebSocket listener on port ${port}:`, err);
      });
    }
  }

  getActiveWebSocketPorts(): number[] {
    return Array.from(this.servers.keys());
  }
}
