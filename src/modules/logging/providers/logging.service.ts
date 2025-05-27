// src/logging/logging.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Log, LogDocument } from '../schemas/log.schema';

@Injectable()
export class LoggingService {
  constructor(
    @InjectModel(Log.name) private logModel: Model<LogDocument>,
    @Inject('SERVICE_NAME') private readonly serviceName: string,
  ) {}

  async log(
    level: string,
    message: string,
    context?: object,
    stack?: string,
    metadata?: object,
    duration?: number,
  ): Promise<LogDocument | null> {
    const logEntry = new this.logModel({
      level,
      message,
      context,
      stack,
      metadata,
      service: this.serviceName,
      duration,
    });

    try {
      return await logEntry.save();
    } catch (error) {
      console.error('Failed to save log to MongoDB:', error);
      return null;
    }
  }

  async error(
    message: string,
    stack?: string,
    context?: object,
    metadata?: object,
  ) {
    return this.log('error', message, context, stack, metadata);
  }

  async warn(message: string, context?: object, metadata?: object) {
    return this.log('warn', message, context, undefined, metadata);
  }

  async info(message: string, context?: object, metadata?: object) {
    return this.log('info', message, context, undefined, metadata);
  }

  async debug(message: string, context?: object, metadata?: object) {
    return this.log('debug', message, context, undefined, metadata);
  }

  async verbose(message: string, context?: object, metadata?: object) {
    return this.log('verbose', message, context, undefined, metadata);
  }

  async getLogs(filter: object = {}, limit = 100): Promise<Log[]> {
    return this.logModel
      .find(filter)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }
}
