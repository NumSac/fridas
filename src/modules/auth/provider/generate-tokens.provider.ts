import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable, Logger } from '@nestjs/common';
import jwtConfig from '../../../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { UserEntity } from '../../user/entities/user.entity';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class GenerateTokensProvider {
  private readonly logger = new Logger(GenerateTokensProvider.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async signToken(
    userId: number,
    expiresIn: number,
    payload?: Omit<ActiveUserData, 'sub'>
  ): Promise<string> {
    try {
      return await this.jwtService.signAsync(
        {
          sub: userId,
          ...payload
        },
        {
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          secret: this.jwtConfiguration.secret,
          expiresIn: `${expiresIn}s`,
        }
      );
    } catch (error) {
      this.logger.error(`Token signing failed for user ${userId}`, error.stack);
      throw new Error('Token signing failed');
    }
  }

  public async generateTokens(user: UserEntity): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload: ActiveUserData = {
        sub: user.id,
        email: user.email,
        role: user.role,
        // username: user.username // Uncomment if needed
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.signToken(
          user.id,
          this.jwtConfiguration.accessTokenTtl,
          payload
        ),
        this.signToken(
          user.id,
          this.jwtConfiguration.refreshTokenTtl
        ),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(`Token generation failed for user ${user.id}`, error.stack);
      throw new Error('Token generation failed');
    }
  }
}