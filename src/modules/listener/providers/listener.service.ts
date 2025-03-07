import {InjectRepository} from "@nestjs/typeorm";
import {ListenerEntity} from "../entities/listener.entity";
import {Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {UserEntity} from "../../user/entities/user.entity";
import {CreateListenerProvider} from "./create-listener.provider";
import {CreateListenerDto} from "../dtos/create-listener.dto";


@Injectable()
export class ListenerService {
    constructor(
        @InjectRepository(ListenerEntity)
        private listenerRepository: Repository<ListenerEntity>,

        private createListenerProvider: CreateListenerProvider,
    ) {}

    public async createListener(createListenerDto: CreateListenerDto) {
        return await this.createListenerProvider.createListener(createListenerDto)
    }

    public async findAll(user: UserEntity): Promise<ListenerEntity[]> {
        return await this.listenerRepository.findBy({ user });
    }
}