

import { JwtService } from '@nestjs/jwt';
import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import jwtConfig from '../../../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { UserEntity } from '../../user/entities/user.entity';
import { UserService } from '../../user/provider/user.service';
import { HashingProvider } from './hashing.provider';

@Injectable()
export class GenerateWebTokensProvider {
  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,

    // Injecting JWT service
    private readonly jwtService: JwtService,

    private readonly hashingProvider: HashingProvider,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async validateWebUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user || !(await this.hashingProvider.comparePassword(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  generateWebToken(user: UserEntity): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });
  }
}
