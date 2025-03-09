import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './provider/auth.service';
import { HashingProvider } from './provider/hashing.provider';
import { LoginProvider } from './provider/login.provider';
import { RefreshTokensProvider } from './provider/refresh-tokens.provider';
import { GenerateTokensProvider } from './provider/generate-tokens.provider';
import { BcryptProvider } from './provider/bcrypt.provider';
import jwtConfig from '../../config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { GenerateWebTokensProvider } from './provider/generate-web-tokens.provider';
import { WebLoginProvider } from './provider/web-login.provider';
import { AuthController } from './auth.controller';
import { AuthApiController } from './auth-api.controller';

@Module({
  imports: [
    forwardRef(() => UserModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController, AuthApiController],
  providers: [
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    AuthService,
    LoginProvider,
    RefreshTokensProvider,
    GenerateTokensProvider,
    GenerateWebTokensProvider,
    WebLoginProvider,
    BcryptProvider,
  ],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
