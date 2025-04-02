import { InjectRepository } from '@nestjs/typeorm';
import { ListenerEntity } from '../entities/listener.entity';
import { Repository } from 'typeorm';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Role, UserEntity } from '../../user/entities/user.entity';
import { CreateListenerDto } from '../dtos/create-listener.dto';
import { ListenerServiceProvider } from './listener-service.provider';
import { ListenerStatus } from '../enums/listener.enum';
import {
  IListenerControlService,
  IListenerCrudService,
} from '../interfaces/listener-service.interface';

@Injectable()
export class ListenerOperationsService
  implements IListenerCrudService, IListenerControlService
{
  constructor(
    @InjectRepository(ListenerEntity)
    private readonly listenerRepository: Repository<ListenerEntity>,
    private readonly listenerServiceProvider: ListenerServiceProvider,
  ) {}

  public async createListener(
    createListenerDto: CreateListenerDto,
    user: UserEntity,
  ): Promise<ListenerEntity> {
    return this.listenerServiceProvider.createListener(createListenerDto, user);
  }

  public async stopListener(listenerPort: number): Promise<void> {
    return this.listenerServiceProvider.stopListener(listenerPort);
  }

  public async startListener(listener: ListenerEntity): Promise<void> {
    return await this.listenerServiceProvider.startListener(listener);
  }

  public async getActivePorts(): Promise<number[]> {
    return this.listenerServiceProvider.getActivePorts();
  }

  public async deleteListener(
    listenerId: string,
    userId: number,
    userRole: Role,
  ): Promise<void> {
    const listener = await this.listenerRepository.findOne({
      where: { id: listenerId },
      relations: ['user'],
    });

    if (!listener) {
      throw new NotFoundException('Listener not found');
    }

    if (userRole !== Role.ADMIN && listener.user.id !== userId) {
      throw new ForbiddenException('You do not own this listener');
    }

    try {
      return this.listenerRepository.manager.transaction(
        async (transactionalEntityManager) => {
          if (listener.status === ListenerStatus.ACTIVE) {
            await this.listenerServiceProvider.stopListener(listener.port);
          }
          await transactionalEntityManager.delete(ListenerEntity, listenerId);
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete listener: ' + error.message,
      );
    }
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

  public async findOneByIdForUser(
    listenerId: string,
    userId: number,
  ): Promise<ListenerEntity | null> {
    return this.listenerRepository.findOne({
      where: {
        id: listenerId,
        user: { id: userId },
      },
      relations: ['user'],
    });
  }
}
