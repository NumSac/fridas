import {InjectRepository} from "@nestjs/typeorm";
import {BaseUser} from "../entities/base-user.entity";
import {Repository} from "typeorm";
import {BadRequestException, Injectable, RequestTimeoutException} from "@nestjs/common";
import {CreateUserDto} from "../dtos/create-user.dto";
import {UserEntity} from "../entities/user.entity";


@Injectable()
export class CreateUserProvider {
    constructor(
        @InjectRepository(UserEntity)
        private baseUserRepository: Repository<UserEntity>
    ) {}

    public async createUser(createUserDto: CreateUserDto) {
        let existingUser: BaseUser | null = null;
        try {
            existingUser = await this.baseUserRepository.findOne({
                where: { email: createUserDto.email },
            })
        } catch (e) {
            // Might save the details of the exception
            // Information which is sensitive
            throw new RequestTimeoutException(
                'Unable to process your request at the moment please try later',
                {
                    description: 'Error connecting to the database',
                },
            );
        }

        // Handle exception
        if (existingUser) {
            throw new BadRequestException(
                'The user already exists, please check your email.',
            );
        }

        // Create a new user
        let newUser = this.baseUserRepository.create({
            ...createUserDto,
        });

        try {
            newUser = await this.baseUserRepository.save(newUser);
        } catch (error) {
            throw new RequestTimeoutException(
                'Unable to process your request at the moment please try later',
                {
                    description: 'Error connecting to the the database',
                },
            );
        }
    }
}