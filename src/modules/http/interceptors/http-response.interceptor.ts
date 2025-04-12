// src/listeners/http/http-response.interceptor.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Request, Response } from 'express';
import { ServerResponse } from 'http';
import { HttpEvent } from '../../listeners/enums/events.enum';

@Injectable()
export class HttpResponseInterceptor {
  @OnEvent(HttpEvent.REQUEST)
  async intercept(payload: { req: Request; res: Response }) {
    const nodeResponse = payload.res;

    nodeResponse.on('finish', () => {
      this.logResponse(payload);
    });
  }

  private logResponse(payload: { req: Request; res: Response }) {
    console.log(
      `[Response] ${payload.res.statusCode} ${payload.req.method} ${payload.req.url}`,
    );
  }
}
