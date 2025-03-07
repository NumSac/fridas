import {Injectable} from "@nestjs/common";
import {ListenerEntity} from "../entities/listener.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import { CreateListenerDto } from "../dtos/create-listener.dto";


@Injectable()
export class CreateListenerProvider {
    constructor(
        @InjectRepository(ListenerEntity)
        private listenerRepository: Repository<ListenerEntity>
    ) {}

    public async createListener(createListenerDto: CreateListenerDto) {
    }
}