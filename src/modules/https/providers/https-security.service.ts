import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HttpEvent } from '../../listeners/enums/events.enum';
import { Request, Response } from 'express';

@Injectable()
export class HttpsSecurityService {
  @OnEvent(HttpEvent.REQUEST)
  checkAuth(payload: { req: Request; res: Response }) {
    if (!this.isAuthenticated(payload.req)) {
      payload.res.status(401).json({ error: 'Unauthorized' });
    }
  }

  private isAuthenticated(req: Request): boolean {
    // Implement authentication logic
    return req.headers['authorization'] === 'valid-token';
  }
}
