import { Module } from '@nestjs/common';
import { HttpListenerProvider } from '../listeners/providers/http-listener.provider';
import { HttpHandlerService } from './providers/http-handler.service';
import { HttpMiddleware } from './middleware/http.middleware';
import { HttpResponseInterceptor } from './interceptors/http-response.interceptor';
import { HttpErrorService } from './providers/http-error.service';
import { HttpMonitorService } from './providers/http-monitor.service';
import { HttpSecurityService } from './providers/http-security.service';
import { ListenerModule } from '../listeners/listener.module';

@Module({
  imports: [ListenerModule],
  providers: [
    HttpHandlerService,
    HttpMiddleware,
    HttpResponseInterceptor,
    HttpErrorService,
    HttpMonitorService,
    HttpSecurityService,
  ],
  exports: [],
})
export class HttpModule {}
