import {Body, Controller, Post} from "@nestjs/common";
import {Auth} from "../auth/decorators/auth.decorator";
import {AuthType} from "../auth/enums/auth-type.enum";
import {CreateListenerDto} from "./dtos/create-listener.dto";
import {ActiveUser} from "../auth/decorators/active-user.decorator";


@Controller('listener')
export class ListenerController {
    constructor(

    ) {}


    @Post()
    @Auth(AuthType.Bearer)
    async create(
        @ActiveUser("sub") userId: number,
        @Body() createListenerDto: CreateListenerDto
    ) {

    }
}