// src/listeners/providers/http-listener-provider.ts
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createServer, Server } from 'http';
import { ListenerEntity } from '../entities/listener.entity';

@Injectable()
export class HttpListenerProvider implements OnApplicationShutdown {
  private servers = new Map<number, Server>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async create(port: number, listener: ListenerEntity): Promise<Server> {
    return new Promise((resolve, reject) => {
      if (this.servers.has(port)) {
        return reject(new Error(`Port ${port} is already in use`));
      }

      const server = createServer((req, res) => {
        this.eventEmitter.emit('http.request', {
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
          this.eventEmitter.emit('http.error', {
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