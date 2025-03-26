import { InjectRepository } from '@nestjs/typeorm';
import { ListenerEntity } from '../entities/listener.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateListenerDto } from '../dtos/create-listener.dto';

@Injectable()
export class ListenerService {
  constructor(
    @InjectRepository(ListenerEntity)
    private readonly listenerRepository: Repository<ListenerEntity>,

    private readonly listenerServiceProvider: ListenerServiceProvider,
  ) {}

  public async createListener(createListenerDto: CreateListenerDto) {
    return
  }

  public async findAll(user: UserEntity): Promise<ListenerEntity[]> {
    return await this.listenerRepository.findBy({ user });
  }
}
