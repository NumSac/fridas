import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { ListenerEntity } from '../entities/listener.entity';
import { IListenerInterface } from '../interfaces/listener.interface';
import { HttpEvent } from '../enums/events.enum';

interface EnhancedResponse extends ServerResponse {
  status?: (code: number) => EnhancedResponse;
  json?: (data: any) => void;
}

function createEnhancedResponse(res: ServerResponse): EnhancedResponse {
  return Object.assign(res, {
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
    },
  });
}

@Injectable()
export class HttpListenerProvider
  implements OnApplicationShutdown, IListenerInterface
{
  private servers = new Map<number, Server>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async create(port: number, listener: ListenerEntity): Promise<Server> {
    return new Promise((resolve, reject) => {
      if (this.servers.has(port)) {
        return reject(new Error(`Port ${port} is already in use`));
      }

      const server = createServer(
        (req: IncomingMessage, res: ServerResponse) => {
          const enhancedRes = createEnhancedResponse(res);

          this.eventEmitter.emit(HttpEvent.REQUEST, {
            req,
            res: enhancedRes, // Use enhanced response
            listener,
            timestamp: new Date(),
          });
        },
      );

      server
        .listen(port, () => {
          this.servers.set(port, server);
          resolve(server);
        })
        .on('error', (err) => {
          this.eventEmitter.emit(HttpEvent.ERROR, {
            error: err,
            listener,
            timestamp: new Date(),
          });
          reject(err);
        });
    });
  }

  async close(port: number): Promise<void> {
    return new Promise((resolve) => {
      const server = this.servers.get(port);
      if (server) {
        server.close(() => {
          this.servers.delete(port);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  onApplicationShutdown() {
    for (const [port] of this.servers) {
      this.close(port).catch(console.error);
    }
  }
}
