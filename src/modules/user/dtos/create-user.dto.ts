import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

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
}