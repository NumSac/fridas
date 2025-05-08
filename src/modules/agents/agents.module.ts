import { forwardRef, Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { ListenerModule } from '../listeners/listener.module';
import { AgentService } from './providers/agent.service';
import { AgentEntity } from './entities/agent.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterAgentProvider } from './providers/register-agent.provider';

@Module({
  imports: [
    forwardRef(() => ListenerModule),
    TypeOrmModule.forFeature([AgentEntity]),
  ],
  providers: [AgentService, RegisterAgentProvider],
  controllers: [AgentsController],
  exports: [AgentService],
})
export class AgentsModule {}
