// src/listeners/http/http-monitor.service.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Request, Response } from 'express';
import { HttpEvent } from '../../listeners/enums/events.enum';

interface RequestPayload {
  req: Request;
  res: Response;
  listener: any; // Update with your ListenerEntity type
  timestamp: Date;
}

@Injectable()
export class HttpsMonitorService {
  private metrics = {
    requestCount: 0,
    errorCount: 0,
    responseTimes: [] as number[],
  };

  @OnEvent(HttpEvent.REQUEST)
  trackRequest(payload: RequestPayload) {
    this.metrics.requestCount++;
    const start = Date.now();

    payload.res.on('finish', () => {
      const duration = Date.now() - start;
      this.metrics.responseTimes.push(duration);
    });
  }

  @OnEvent(HttpEvent.ERROR)
  trackError() {
    this.metrics.errorCount++;
  }

  getMetrics() {
    return {
      ...this.metrics,
      avgResponseTime:
        this.metrics.responseTimes.length > 0
          ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) /
            this.metrics.responseTimes.length
          : 0,
    };
  }
}
