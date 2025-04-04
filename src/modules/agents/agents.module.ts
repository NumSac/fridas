import { forwardRef, Module } from '@nestjs/common';
import { ListenerOperationsService } from '../listeners/providers/listener-operations.service';
import { AgentsController } from './agents.controller';

@Module({
  imports: [forwardRef(() => ListenerOperationsService)],
  providers: [],
  controllers: [AgentsController],
  exports: [],
})
export class AgentsModule {}
