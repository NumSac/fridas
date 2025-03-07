import {ApiProperty} from "@nestjs/swagger";
import {IsBoolean, IsEnum, IsJSON, IsNotEmpty, IsPort} from "class-validator";
import { Protocol } from "../enums/listener.enum";


export class CreateListenerDto {
    @IsNotEmpty()
    name: string;

    @IsEnum(Protocol)
    protocol: Protocol;

    @IsPort()
    port: number;

    @IsBoolean()
    isActive: boolean;

    @IsJSON()
    options: string;
}