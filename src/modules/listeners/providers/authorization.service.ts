import { ForbiddenException, Injectable } from '@nestjs/common';
import { ListenerEntity } from '../entities/listener.entity';
import { Role } from '../../user/entities/user.entity';

@Injectable()
export class AuthorizationService {
  public checkListenerOwnership(
    listener: ListenerEntity,
    userId: number,
    role: Role,
  ): void {
    if (role !== Role.ADMIN && listener.user.id !== userId) {
      throw new ForbiddenException('Unauthorized access to listener resource');
    }
  }
}
