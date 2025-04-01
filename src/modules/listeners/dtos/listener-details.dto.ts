import { Expose, Transform, Type } from 'class-transformer';
import { ListenerStatus, Protocol } from '../enums/listener.enum';

export class SSLConfigDto {
  @Expose()
  keyPath: string;

  @Expose()
  certPath: string;

  @Expose()
  @Transform(({ value }) => !!value)
  hasCA?: boolean;

  @Expose()
  @Transform(({ value }) => !!value)
  passphraseExists: boolean;

  @Expose()
  rejectUnauthorized: boolean;
}

export class ListenerOptionsDto {
  @Expose()
  @Type(() => SSLConfigDto)
  ssl?: SSLConfigDto;

  @Expose()
  authenticationRequired: boolean;

  @Expose()
  maxConnections?: number;

  @Expose()
  whitelistIps?: string[];
}

export class ListenerResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  protocol: Protocol;

  @Expose()
  port: number;

  @Expose()
  status: ListenerStatus;

  @Expose()
  @Type(() => ListenerOptionsDto)
  options?: ListenerOptionsDto;

  @Expose()
  @Transform(({ value }) => (value?.toISOString ? value.toISOString() : value))
  createdAt: string;

  @Expose()
  @Transform(({ value }) => (value?.toISOString ? value.toISOString() : value))
  updatedAt: string;

  @Expose()
  connectionCount?: number;

  @Expose()
  @Transform(({ value }) => value?.username)
  user: string;

  @Expose()
  @Transform(({ obj }) => obj.protocol === Protocol.HTTPS)
  get isSecure(): boolean {
    return this.protocol === Protocol.HTTPS;
  }
}
