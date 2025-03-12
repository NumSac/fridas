import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UserService } from '../../user/provider/user.service';
import { Role } from '../../user/entities/user.entity';
import { HashingProvider } from '../../auth/provider/hashing.provider';


@Injectable()
export class DatabaseSeederService  implements OnApplicationBootstrap {
  constructor(private readonly userService: UserService, private readonly hashingProvider: HashingProvider) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedAdminUser()
  }

  private async seedAdminUser(): Promise<void> {
    const adminEmail = "admin@example.com";

    try {
      const existingUser = await this.userService.findOneByEmail(adminEmail);

      // Should be random generated
      const password = "admin123!"

      if (!existingUser) {
        await this.userService.createUser({
          email: adminEmail,
          username: "samson",
          password: await this.hashingProvider.hashPassword(password),
          role: Role.ADMIN,
        })
        console.log(`[***] Admin User Created. Email: ${adminEmail} and Password: ${password} [***]`)
      }
    } catch (e) {
      console.error("Error seeding admin user: ", e)
    }
  }
}