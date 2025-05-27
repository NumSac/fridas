// src/logging/schemas/log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogDocument = Log & Document;

@Schema({ timestamps: true })
export class Log {
  @Prop({ required: true, enum: ['error', 'warn', 'info', 'debug', 'verbose'] })
  level: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  context?: object;

  @Prop()
  stack?: string;

  @Prop({ type: Object })
  metadata?: object;

  @Prop()
  service?: string;

  @Prop()
  duration?: number;
}

export const LogSchema = SchemaFactory.createForClass(Log);
