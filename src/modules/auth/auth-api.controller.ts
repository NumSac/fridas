import { Body, Controller, Get, HttpCode, HttpStatus, Post} from '@nestjs/common';
import { AuthService } from './provider/auth.service';
import { LoginDto } from './dtos/login.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Controller('api/auth')
export class AuthApiController {
  constructor(
    private readonly authService: AuthService,
  ) {}


  // Existing API endpoints
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto);
  }

  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}