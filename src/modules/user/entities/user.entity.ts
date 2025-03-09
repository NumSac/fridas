import { Column, Entity, OneToMany } from 'typeorm';
import { BaseUser } from './base-user.entity';
import { ListenerEntity } from '../../listener/entities/listener.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseUser {
  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
    unique: false,
  })
  username: string;
  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
  })
  password: string;

  @OneToMany(() => ListenerEntity, (listener) => listener.user)
  listener?: ListenerEntity[];
}
