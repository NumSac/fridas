// src/listeners/http/http.middleware.ts
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ListenerEntity } from '../../listeners/entities/listener.entity';

@Injectable()
export class HttpMiddleware {
  apply(req: Request, res: Response, listener: ListenerEntity) {
    this.logRequest(req);
    this.addSecurityHeaders(res);
    this.rateLimit(req);
  }

  private logRequest(req: Request) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }

  private addSecurityHeaders(res: Response) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
  }

  private rateLimit(req: Request) {
    // Implement rate limiting logic
  }
}
