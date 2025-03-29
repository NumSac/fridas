import { InjectRepository } from '@nestjs/typeorm';
import { ListenerEntity } from '../entities/listener.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateListenerDto } from '../dtos/create-listener.dto';
import { ListenerServiceProvider } from './listener-service.provider';

@Injectable()
export class ListenerService {
  constructor(
    @InjectRepository(ListenerEntity)
    private readonly listenerRepository: Repository<ListenerEntity>,
    private readonly listenerServiceProvider: ListenerServiceProvider,
  ) {}

  public async createListener(createListenerDto: CreateListenerDto) {
    return this.listenerServiceProvider.createListener(createListenerDto);
  }

  public async deleteListener(listenerId: number) {
    return this.listenerServiceProvider.stopListener(listenerId);
  }

  public async startListener(listenerPort: number) {
    return this.listenerServiceProvider.restartListener(listenerPort);
  }

  public async getActivePorts(): Promise<number[]> {
    return this.listenerServiceProvider.getActivePorts();
  }

  public async findAll(): Promise<ListenerEntity[]> {
    return await this.listenerRepository.find();
  }

  public async findAllForUser(userId: number): Promise<ListenerEntity[]> {
    return this.listenerRepository.find({
      where: {
        user: { id: userId },
      },
    });
  }
}
