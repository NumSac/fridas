// src/logging/logging.module.ts
import { Module, Global, DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './schemas/log.schema';
import { LoggingService } from './providers/logging.service';

@Global()
@Module({})
export class LoggingModule {
  static forRoot(serviceName: string): DynamicModule {
    return {
      module: LoggingModule,
      imports: [
        MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
      ],
      providers: [
        LoggingService,
        {
          provide: 'SERVICE_NAME',
          useValue: serviceName,
        },
      ],
      exports: [LoggingService],
    };
  }
}
