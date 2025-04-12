// src/listeners/http/http-security.service.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HttpEvent } from '../../listeners/enums/events.enum';
import { IncomingMessage, ServerResponse } from 'http';

interface EnhancedResponse extends ServerResponse {
  status: (code: number) => EnhancedResponse;
  json: (data: any) => void;
}

@Injectable()
export class HttpSecurityService {
  @OnEvent(HttpEvent.REQUEST)
  checkAuth(payload: { req: IncomingMessage; res: EnhancedResponse }) {
    if (!this.isAuthenticated(payload.req)) {
      this.sendUnauthorized(payload.res);
    }
  }

  private isAuthenticated(req: IncomingMessage): boolean {
    const authHeader = req.headers.authorization || '';
    return this.validateToken(authHeader);
  }

  private sendUnauthorized(res: EnhancedResponse) {
    try {
      if (res.headersSent) return;

      res.status(401).json({ error: 'Unauthorized' });
    } catch (error) {
      console.error('Failed to send unauthorized response:', error);
      this.fallbackErrorResponse(res);
    }
  }

  private validateToken(token: string): boolean {
    // Implement actual token validation logic
    return token === 'valid-token';
  }

  private fallbackErrorResponse(res: ServerResponse) {
    if (!res.headersSent) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }
}
