import { CreateListenerDto } from '../dtos/create-listener.dto';
import { ListenerEntity } from '../entities/listener.entity';
import { Role, UserEntity } from '../../user/entities/user.entity';

export interface IListenerCrudService {
  createListener(
    createListenerDto: CreateListenerDto,
    user: UserEntity,
  ): Promise<ListenerEntity>;

  deleteListener(
    listenerId: string,
    userId: number,
    userRole: Role,
  ): Promise<void>;

  findAll(): Promise<ListenerEntity[]>;

  findAllForUser(userId: number): Promise<ListenerEntity[]>;

  findOneByIdForUser(
    listenerId: string,
    userId: number,
  ): Promise<ListenerEntity | null>;
}

export interface IListenerControlService {
  stopListener(listenerPort: number): Promise<void>;

  startListener(listenerPort: number): Promise<void>;

  getActivePorts(): Promise<number[]>;
}
