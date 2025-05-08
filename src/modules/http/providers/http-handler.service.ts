import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ListenerEntity } from '../../listeners/entities/listener.entity';
import { HttpEvent } from '../../listeners/enums/events.enum';

@Injectable()
export class HttpHandlerService {
  @OnEvent(HttpEvent.REQUEST)
  handleRequest(payload: {
    req: Request;
    res: Response;
    listener: ListenerEntity;
    timestamp: Date;
  }) {
    console.log(`Request received on port ${payload.listener.port}`);
    this.validateRequest(payload.req);
    this.logRequest(payload);
  }

  @OnEvent(HttpEvent.REGISTER)
  handleRegister(payload: {
    req: Request;
    res: Response;
    listener: ListenerEntity;
    timestamp: Date;
  }) {}

  @OnEvent(HttpEvent.ERROR)
  handleError(payload: {
    error: Error;
    listener: ListenerEntity;
    timestamp: Date;
  }) {
    console.error(
      `HTTP Error on port ${payload.listener.port}:`,
      payload.error,
    );
    this.notifyMonitoringSystem(payload);
  }

  private validateRequest(req: Request) {
    // Add request validation logic
  }

  private logRequest(payload: any) {
    // Add request logging
  }

  private notifyMonitoringSystem(payload: any) {
    // Send alerts/notifications
  }
}
