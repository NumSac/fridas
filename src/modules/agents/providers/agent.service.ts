import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEntity } from '../entities/agent.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async findAll(): Promise<AgentEntity[]> {
    return this.agentRepository.find({
      order: {
        lastCheckIn: 'DESC',
      },
    });
  }

  async findOneById(id: string): Promise<AgentEntity | null> {
    const agent = await this.agentRepository.findOneBy({ id });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    return agent;
  }

  async delete(id: string): Promise<void> {
    const result = await this.agentRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }
  }
}
