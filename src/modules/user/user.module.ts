import {forwardRef, Module} from "@nestjs/common";
import { UserService } from "./provider/user.service";
import {UserController} from "./user.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {CreateUserProvider} from "./provider/create-user.provider";
import {FindOneByEmailProvider} from "./provider/find-one-by-email.provider";
import {UserEntity} from "./entities/user.entity";


@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), forwardRef(() => UserModule)],
    controllers: [UserController],
    providers: [UserService, CreateUserProvider, FindOneByEmailProvider],
    exports: [UserService],
})
export class UserModule {}