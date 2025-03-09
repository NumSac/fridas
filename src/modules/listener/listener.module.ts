import { Module } from '@nestjs/common';
import { ListenerServiceService } from './providers/listener-service.service';
import { ListenerService } from './providers/listener.service';
import { ListenerController } from './listener.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListenerEntity } from './entities/listener.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ListenerEntity])],
  providers: [ListenerService, ListenerServiceService],
  controllers: [ListenerController],
  exports: [ListenerService, ListenerServiceService],
})
export class ListenerModule {}
