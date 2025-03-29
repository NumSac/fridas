import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsPort, ValidateNested } from 'class-validator';
import { Protocol } from '../enums/listener.enum';
import { Type } from 'class-transformer';
import { ListenerOptions } from '../interfaces/listener-options.interface';

export class CreateListenerDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(Protocol)
  protocol: Protocol;

  @IsPort()
  port: number;

  @IsBoolean()
  isActive: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  options: ListenerOptions;
}