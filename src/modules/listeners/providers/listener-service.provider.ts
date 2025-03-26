// src/listeners/listeners.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListenerEntity } from '../entities/listener.entity';
import { ListenerStatus, Protocol } from '../enums/listener.enum';
import { CreateListenerDto } from '../dtos/create-listener.dto';
import { HttpListenerProvider } from './http-listener.provider';
import { HttpsListenerProvider } from './https-listener.provider';
import { TcpListenerProvider } from './tcp-listener.provider';
import { WebsocketListenerProvider } from './websocket-listener.provider';

interface ListenerCreationParams extends Omit<CreateListenerDto, 'options'> {
  options: ListenerOptions;
  status: ListenerStatus;
}

@Injectable()
export class ListenerService implements OnModuleInit, OnModuleDestroy {
  private activeListeners = new Map<
    number,
    {
      server: any;
      type: Protocol;
      cleanup: () => Promise<void>;
      id: string;
    }
  >();

  constructor(
    @InjectRepository(ListenerEntity)
    private readonly listenersRepository: Repository<ListenerEntity>,
    private readonly httpListener: HttpListenerProvider,
    private readonly httpsListener: HttpsListenerProvider,
    private readonly tcpListener: TcpListenerProvider,
    private readonly wsListener: WebsocketListenerProvider,
  ) {}

  async onModuleInit() {
    const activeListeners = await this.listenersRepository.find({
      where: { isActive: true },
    });
    await Promise.all(
      activeListeners.map((listener) => this.startListener(listener)),
    );
  }

  async onModuleDestroy() {
    await Promise.all(
      Array.from(this.activeListeners.values()).map(async ({ cleanup, id }) => {
        try {
          await cleanup();
          await this.updateListenerStatus(id, ListenerStatus.INACTIVE);
        } catch (error) {
          console.error('Error closing listener:', error);
          await this.updateListenerStatus(id, ListenerStatus.ERROR);
        }
      }),
    );
    this.activeListeners.clear();
  }

  public async stopListener(port: number): Promise<void> {
    const listenerEntry = this.activeListeners.get(port);
    if (!listenerEntry) return;

    try {
      await listenerEntry.cleanup();
      this.activeListeners.delete(port);
      await this.updateListenerStatus(
        listenerEntry.id,
        ListenerStatus.INACTIVE,
      );
    } catch (error) {
      await this.updateListenerStatus(listenerEntry.id, ListenerStatus.ERROR);
      throw new Error(`Failed to stop listener on port ${port}: ${error.message}`);
    }
  }

  public async restartListener(port: number): Promise<void> {
    await this.stopListener(port);
    const listener = await this.listenersRepository.findOneBy({ port });
    if (listener) {
      await this.startListener(listener);
    }
  }

  public getActivePorts(): number[] {
    return Array.from(this.activeListeners.keys());
  }

  async createListener(createDto: CreateListenerDto): Promise<ListenerEntity> {
    // Convert and validate options
    const options = createDto.options

    // Create with proper typing
    const creationParams: ListenerCreationParams = {
      ...createDto,
      options,
      status: ListenerStatus.INACTIVE
    };

    return this.listenersRepository.save(
      this.listenersRepository.create(creationParams)
    );
  }

  private async startListener(listener: ListenerEntity) {
    try {
      if (this.activeListeners.has(listener.port)) {
        throw new Error(`Port ${listener.port} is already in use`);
      }

      const { server, cleanup } = await this.createServer(listener);

      this.activeListeners.set(listener.port, {
        server,
        type: listener.protocol,
        cleanup,
        id: listener.id,
      });

      await this.updateListenerStatus(listener.id, ListenerStatus.ACTIVE);
    } catch (error) {
      await this.updateListenerStatus(listener.id, ListenerStatus.ERROR);
      throw error;
    }
  }

  private async createServer(listener: ListenerEntity) {
    switch (listener.protocol) {
      case Protocol.HTTP:
        const httpServer = await this.httpListener.create(
          listener.port,
          listener.options,
        );
        return {
          server: httpServer,
          cleanup: () => this.httpListener.close(listener.port),
        };

      case Protocol.HTTPS:
        const httpsServer = await this.httpsListener.create(
          listener.port,
          listener.options,
        );
        return {
          server: httpsServer,
          cleanup: () => this.httpsListener.close(listener.port),
        };

      case Protocol.TCP:
        const tcpServer = await this.tcpListener.create(
          listener.port,
          listener.options,
        );
        return {
          server: tcpServer,
          cleanup: () => this.tcpListener.close(listener.port),
        };

      case Protocol.WEBSOCKET:
        const { httpServer, cleanup } = await this.wsListener.create(
          listener.port,
          listener.options,
        );
        return {
          server: httpServer,
          cleanup,
        };

      default:
        throw new Error(`Unsupported protocol: ${listener.protocol}`);
    }
  }

  private async updateListenerStatus(id: string, status: ListenerStatus) {
    await this.listenersRepository.update(id, { status });
  }
}