// src/listeners/listeners.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListenerEntity } from '../entities/listener.entity';
import { ListenerStatus, Protocol } from '../enums/listener.enum';
import { HttpListenerProvider } from './http-listener.provider';
import { HttpsListenerProvider } from './https-listener.provider';
import { TcpListenerProvider } from './tcp-listener.provider';
import { WebsocketListenerProvider } from './websocket-listener.provider';
import { CreateListenerDto } from '../dtos/create-listener.dto';

@Injectable()
export class ListenerServiceProvider implements OnModuleInit, OnModuleDestroy {
  private activeListeners = new Map<number, { server: any; type: Protocol }>();

  constructor(
    @InjectRepository(ListenerEntity)
    private readonly listenersRepository: Repository<ListenerEntity>,

    private readonly httpListenerProvider: HttpListenerProvider,
    private readonly httpsListenerProvider: HttpsListenerProvider,
    private readonly tcpListenerProvider: TcpListenerProvider,
    private readonly wsListenerProvider: WebsocketListenerProvider,
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
      let server: any;
      let cleanup: () => Promise<void>;

      switch (listener.protocol) {
        case Protocol.HTTP:
          server = await this.httpListenerProvider.create(listener.port, listener);
          cleanup = () => this.httpListenerProvider.close(listener.port);
          break;

        case Protocol.HTTPS:
          server = await this.httpsListenerProvider.create(listener.port, listener);
          cleanup = () => this.httpsListenerProvider.close(listener.port);
          break;

        case Protocol.TCP:
          server = await this.tcpListenerProvider.create(listener.port, listener);
          cleanup = () => this.tcpListenerProvider.close(listener.port);
          break;

        case Protocol.WEBSOCKET:
          const { httpServer } = await this.wsListenerProvider.create(listener.port, listener);
          server = httpServer;
          cleanup = () => this.wsListenerProvider.close(listener.port);
          break;

        default:
          throw new Error(`Unsupported protocol: ${listener.protocol}`);
      }

      this.activeListeners.set(listener.port, {
        server,
        type: listener.protocol,
      });

      await this.updateListenerStatus(listener.id, ListenerStatus.ACTIVE);
    } catch (error) {
      await this.updateListenerStatus(listener.id, ListenerStatus.ERROR);
      throw error;
    }
  }

  private async updateListenerStatus(id: string, status: ListenerStatus) {
    await this.listenersRepository.update(id, { status });
  }

  getActivePorts(): number[] {
    return Array.from(this.activeListeners.keys());
  }
}
