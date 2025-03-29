import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import environmentValidation from '../../config/environment.validation';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import jwtConfig from '../../config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthenticationGuard } from '../auth/guards/authentication/authentication.guard';
import { AccessTokenGuard } from '../auth/guards/access-token/access-token.guard';
import { DataResponseInterceptor } from '../../common/interceptors/data-response/data-response.interceptor';
import appConfig from '../../config/app.config';
import databaseConfig from '../../config/database.config';
import { ListenerModule } from '../listeners/listener.module';
import { AppController } from './app.controller';
import { DatabaseSeederService } from './db/database-seeder.service';
import { ListenerController } from '../listeners/listener.controller';

// Get the current NODE_ENV
const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    UserModule,
    AuthModule,
    ListenerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      //envFilePath: ['.env.development', '.env'],
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      validationSchema: environmentValidation,
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        synchronize: configService.get('database.synchronize'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        host: configService.get('database.host'),
        autoLoadEntities: configService.get('database.autoLoadEntities'),
        database: configService.get('database.name')
      }),
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    DatabaseSeederService,
  ],
  controllers: [AppController, ListenerController]
})
export class AppModule {}
