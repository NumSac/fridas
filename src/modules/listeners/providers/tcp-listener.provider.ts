import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createServer, Server } from 'net';
import { ListenerEntity } from '../entities/listener.entity';
import { IListenerInterface } from '../interfaces/listener.interface';

@Injectable()
export class TcpListenerProvider
  implements OnApplicationShutdown, IListenerInterface
{
  private servers = new Map<number, Server>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async create(port: number, listener: ListenerEntity): Promise<Server> {
    return new Promise((resolve, reject) => {
      if (this.servers.has(port)) {
        return reject(new Error(`Port ${port} is already in use`));
      }

      const server = createServer((socket) => {
        this.eventEmitter.emit('tcp.connection', {
          socket,
          listener,
          timestamp: new Date(),
        });

        socket.on('data', (data) => {
          this.eventEmitter.emit('tcp.data', {
            socket,
            data,
            listener,
            timestamp: new Date(),
          });
        });

        socket.on('close', () => {
          this.eventEmitter.emit('tcp.close', {
            socket,
            listener,
            timestamp: new Date(),
          });
        });
      });

      server
        .listen(port, () => {
          this.servers.set(port, server);
          resolve(server);
        })
        .on('error', (err) => {
          this.eventEmitter.emit('tcp.error', {
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
