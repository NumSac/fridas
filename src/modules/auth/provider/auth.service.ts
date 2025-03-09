import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/provider/user.service';
import { LoginProvider } from './login.provider';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokensProvider } from './refresh-tokens.provider';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { GenerateWebTokensProvider } from './generate-web-tokens.provider';
import { WebLoginProvider } from './web-login.provider';
import { UserEntity } from '../../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,

    /**
     * Inject the signInProvider
     */
    private readonly loginProvider: LoginProvider,

    /**
     * Inject refreshTokensProvider
     */
    private readonly refreshTokensProvider: RefreshTokensProvider,
    /**
     * Inject CreateWebToken
     */
    private readonly generateWebTokensProvider: GenerateWebTokensProvider,
    /**
     * Inject refreshTokensProvider
     */
    private readonly webLoginProvider: WebLoginProvider,
  ) {}

  public async signIn(loginDto: LoginDto) {
    return await this.loginProvider.login(loginDto);
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokensProvider.refreshTokens(refreshTokenDto);
  }

  public async webLogin(loginDto: LoginDto) {
    return await this.webLoginProvider.webLogin(loginDto);
  }

  public async generateWebTokens(user: UserEntity) {
    return await this.generateWebTokens(user);
  }

}
