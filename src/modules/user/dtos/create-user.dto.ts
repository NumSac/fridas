import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(96)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(96)
  email: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsNotEmpty()
  @MaxLength(96)
  password: string;

  @IsEnum(Role, { each: true })
  @IsOptional()
  role: Role = Role.OPERATOR;
}