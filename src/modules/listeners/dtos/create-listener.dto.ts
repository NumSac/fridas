import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPort,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Protocol } from '../enums/listener.enum';
import { Type } from 'class-transformer';

class SslOptions {
  @IsString()
  keyPath: string;

  @IsString()
  certPath: string;

  @IsOptional()
  @IsString()
  caPath?: string;

  @IsOptional()
  @IsString()
  passphrase?: string;

  @IsOptional()
  @IsBoolean()
  rejectUnauthorized?: boolean;
}

class ListenerOptions {
  @IsOptional()
  @ValidateNested()
  @Type(() => SslOptions)
  ssl?: SslOptions;

  @IsOptional()
  @IsBoolean()
  authenticationRequired?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  maxConnections?: number;

  @IsOptional()
  @IsString({ each: true })
  whitelistIps?: string[];
}

export class CreateListenerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(Protocol)
  protocol: Protocol;

  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ListenerOptions)
  options?: ListenerOptions;
}
