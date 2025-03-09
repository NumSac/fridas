import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserProvider } from './create-user.provider';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserEntity } from '../entities/user.entity';
import { FindOneByEmailProvider } from './find-one-by-email.provider';

@Injectable()
export class UserService {
  constructor(
    /**
     * Injecting usersRepository
     */
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    /**
     * Inject Create Users Provider
     */
    private readonly createUserProvider: CreateUserProvider,

    /**
     * Inject findOneUserByEmailProvider
     */
    private readonly findOneByEmailProvider: FindOneByEmailProvider,
  ) {}

  public async createUser(createUserDto: CreateUserDto) {
    return await this.createUserProvider.createUser(createUserDto);
  }

  public async findOneByEmail(email: string) {
    return await this.findOneByEmailProvider.findOneByEmail(email);
  }

  public async findOneById(id: number) {
    let user: UserEntity | null = null;

    try {
      user = await this.userRepository.findOneBy({ id: id });
      return user;
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
