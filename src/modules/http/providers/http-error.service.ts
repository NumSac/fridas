// src/listeners/http/http-error.service.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Request, Response } from 'express';
import { ListenerEntity } from 'src/modules/listeners/entities/listener.entity';
import { HttpEvent } from 'src/modules/listeners/enums/events.enum';

type ErrorPayload = {
  error: Error;
  req?: Request;
  res?: Response;
  listener: ListenerEntity;
  timestamp: Date;
};

@Injectable()
export class HttpErrorService {
  @OnEvent(HttpEvent.ERROR)
  handleError(payload: ErrorPayload) {
    // Check if response exists and headers haven't been sent
    if (payload.res && !payload.res.headersSent) {
      this.sendErrorResponse(payload.res, payload.error);
    }

    this.logError(payload.error, payload.req);
  }

  private sendErrorResponse(res: Response, error: Error) {
    const statusCode = this.getStatusCode(error);
    const message = this.getErrorMessage(error);

    res.status(statusCode).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  private getStatusCode(error: Error): number {
    // Add custom error status mapping logic
    return 500;
  }

  private getErrorMessage(error: Error): string {
    return process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : error.message;
  }

  private logError(error: Error, req?: Request) {
    console.error({
      message: error.message,
      stack: error.stack,
      path: req?.originalUrl,
      method: req?.method,
      timestamp: new Date().toISOString(),
    });
  }
}
