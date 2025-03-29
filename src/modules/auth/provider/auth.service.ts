import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/provider/user.service';
import { LoginProvider } from './login.provider';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokensProvider } from './refresh-tokens.provider';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
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
  ) {}

  public async signIn(loginDto: LoginDto) {
    return await this.loginProvider.login(loginDto);
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokensProvider.refreshTokens(refreshTokenDto);
  }

}
