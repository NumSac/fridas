// src/listeners/listeners.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { ListenerEntity } from '../entities/listener.entity';
import { ListenerStatus, Protocol } from '../enums/listener.enum';
import { createHttpsServer } from '../util/create-https-server';
import { createHttpServer } from '../util/create-http-server';

@Injectable()
export class ListenerServiceService implements OnModuleInit, OnModuleDestroy {
  private activeListeners = new Map<number, { server: any; type: Protocol }>();

  constructor(
    @InjectRepository(ListenerEntity)
    private readonly listenersRepository: Repository<ListenerEntity>,
  ) {}

  async onModuleInit() {
    // Start all active listeners from database on app startup
    const activeListeners = await this.listenersRepository.find({
      where: { isActive: true },
    });
    activeListeners.forEach((listener) => this.startListener(listener));
  }

  async onModuleDestroy() {
    // Cleanup all listeners when app shuts down
    for (const [port, { server }] of this.activeListeners) {
      server.close();
    }
    this.activeListeners.clear();
  }

  private async startListener(listener: ListenerEntity) {
    try {
      let server: http.Server | net.Server | WebSocketServer;

      switch (listener.protocol) {
        case Protocol.HTTP:
          server = await createHttpServer(listener);
          break;
        case Protocol.HTTPS:
          server = await createHttpsServer(listener);
          break;
        case Protocol.TCP:
          server = await this.createTcpListener(listener);
          break;
        case Protocol.WEBSOCKET:
          server = await this.createWebSocketListener(listener);
          break;
        default:
          throw new Error(`Unsupported protocol: ${listener.protocol}`);
      }

      this.activeListeners.set(listener.port, {
        server,
        type: listener.protocol,
      });

      await this.listenersRepository.update(listener.id, {
        status: ListenerStatus.ACTIVE,
      });
    } catch (error) {
      await this.listenersRepository.update(listener.id, {
        status: ListenerStatus.ERROR,
      });
      throw error;
    }
  }

  private createTcpListener(listener: ListenerEntity): Promise<net.Server> {
    return new Promise((resolve, reject) => {
      const server = net.createServer((socket) => {
        // Handle TCP connections
      });

      server
        .listen(listener.port, () => {
          console.log(`TCP listener started on port ${listener.port}`);
          resolve(server);
        })
        .on('error', reject);
    });
  }

  private createWebSocketListener(
    listener: ListenerEntity,
  ): Promise<WebSocketServer> {
    return new Promise((resolve, reject) => {
      const httpServer = createServer();
      const wss = new WebSocketServer({ server: httpServer });

      wss.on('connection', (ws) => {
        // Handle WebSocket connections
      });

      httpServer
        .listen(listener.port, () => {
          console.log(`WebSocket listener started on port ${listener.port}`);
          resolve(wss);
        })
        .on('error', reject);
    });
  }

  // Add similar methods for HTTPS and other protocols

  async stopListener(port: number) {
    const listener = this.activeListeners.get(port);
    if (listener) {
      listener.server.close();
      this.activeListeners.delete(port);

      await this.listenersRepository.update(
        { port },
        { status: ListenerStatus.INACTIVE },
      );
    }
  }

  async restartListener(port: number) {
    await this.stopListener(port);
    const listener = await this.listenersRepository.findOneBy({ port });
    if (listener) {
      await this.startListener(listener);
    }
  }

  getActivePorts(): number[] {
    return Array.from(this.activeListeners.keys());
  }
}
