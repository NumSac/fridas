import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createServer, Server } from 'https';
import { readFileSync } from 'fs';
import { ListenerEntity } from '../entities/listener.entity';
import { IListenerInterface } from '../interfaces/listener.interface';

@Injectable()
export class HttpsListenerProvider
  implements OnApplicationShutdown, IListenerInterface
{
  private servers = new Map<number, Server>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async create(port: number, listener: ListenerEntity): Promise<Server> {
    return new Promise((resolve, reject) => {
      if (this.servers.has(port)) {
        return reject(new Error(`Port ${port} is already in use`));
      }

      const options = this.getSslOptions(listener);

      const server = createServer(options, (req, res) => {
        this.eventEmitter.emit('https.request', {
          req,
          res,
          listener,
          timestamp: new Date(),
        });
      });

      server
        .listen(port, () => {
          this.servers.set(port, server);
          resolve(server);
        })
        .on('error', (err) => {
          this.eventEmitter.emit('https.error', {
            error: err,
            listener,
            timestamp: new Date(),
          });
          reject(err);
        });
    });
  }

  private getSslOptions(listener: ListenerEntity) {
    if (!listener.options.ssl) throw new Error('[!] No SSL options provided');
    return {
      key: readFileSync(listener.options.ssl?.keyPath),
      cert: readFileSync(listener.options.ssl?.certPath),
      ca: listener.options.ssl.caPath
        ? readFileSync(listener.options.ssl.caPath)
        : undefined,
    };
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
