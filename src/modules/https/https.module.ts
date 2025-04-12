import { Module } from '@nestjs/common';
import { HttpsResponseInterceptor } from './interceptors/https-response.interceptor';
import { HttpsErrorService } from './providers/https-error.service';
import { HttpSecurityService } from '../http/providers/http-security.service';
import { HttpsMonitorService } from './providers/https-monitor.service';
import { HttpsMiddleware } from './middleware/https.middleware';

@Module({
  imports: [],
  controllers: [],
  providers: [
    HttpsResponseInterceptor,
    HttpsErrorService,
    HttpSecurityService,
    HttpsMonitorService,
    HttpsMiddleware,
  ],
  exports: [],
})
export class HttpsModule {}
