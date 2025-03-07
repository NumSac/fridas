import {forwardRef, Module} from "@nestjs/common"
import {UserModule} from "../user/user.module";
import {AuthService} from "./provider/auth.service";
import {HashingProvider} from "./provider/hashing.provider";
import {LoginProvider} from "./provider/login.provider";
import {RefreshTokensProvider} from "./provider/refresh-tokens.provider";
import {GenerateTokensProvider} from "./provider/generate-tokens.provider";
import {BcryptProvider} from "./provider/bcrypt.provider";

@Module({
    imports: [forwardRef(() => UserModule)],
    controllers: [],
    providers: [AuthService, LoginProvider, RefreshTokensProvider, GenerateTokensProvider, BcryptProvider],
    exports: [AuthService],
})
export class AuthModule {}