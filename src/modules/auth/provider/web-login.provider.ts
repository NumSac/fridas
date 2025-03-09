import {
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { LoginDto } from '../dtos/login.dto';
import { UserService } from '../../user/provider/user.service';
import { LoginProvider } from './login.provider';

@Injectable()
export class WebLoginProvider {
  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly loginProvider: LoginProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async webLogin(loginDto: LoginDto) {
    // Reuse existing validation through login provider
    const apiResponse = await this.loginProvider.login(loginDto);

    return {
      accessToken: apiResponse.accessToken,
      user: loginDto.email
    };
  }
}
