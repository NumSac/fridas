import {Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors} from "@nestjs/common";
import {CreateUserDto} from "./dtos/create-user.dto";
import {ActiveUser} from "../auth/decorators/active-user.decorator";
import {ActiveUserData} from "../auth/interfaces/active-user-data.interface";
import {Auth} from "../auth/decorators/auth.decorator";
import {AuthType} from "../auth/enums/auth-type.enum";
import {UserService} from "./provider/user.service";


@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Post("create-user")
    @Auth(AuthType.Bearer)
    public async createUser(
        @Body() createUserDto: CreateUserDto,
        @ActiveUser() user: ActiveUserData
    ) {}

    @Post()
    @UseInterceptors(ClassSerializerInterceptor)
    @Auth(AuthType.Bearer)
    public createUsers(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }
}