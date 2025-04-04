// src/logging/http-logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from '../../../modules/logging/providers/logging.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - start;

          this.loggingService.info(
            'HTTP Request',
            {
              method: request.method,
              path: request.url,
              statusCode: response.statusCode,
              duration,
              ip: request.ip,
              userAgent: request.headers['user-agent'],
            },
            {
              body: request.body,
              params: request.params,
              query: request.query,
            },
          );
        },
        error: (error) => {
          const duration = Date.now() - start;

          this.loggingService.error(
            'HTTP Error',
            error.stack,
            {
              method: request.method,
              path: request.url,
              statusCode: error.getStatus?.() || 500,
              duration,
              ip: request.ip,
              userAgent: request.headers['user-agent'],
            },
            {
              error: error.message,
              stack: error.stack,
            },
          );
        },
      }),
    );
  }
}
