import { forwardRef, Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { ListenerModule } from '../listeners/listener.module';
import { AgentService } from './providers/agent.service';
import { AgentEntity } from './entities/agent.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    forwardRef(() => ListenerModule),
    TypeOrmModule.forFeature([AgentEntity]),
  ],
  providers: [AgentService],
  controllers: [AgentsController],
  exports: [],
})
export class AgentsModule {}
