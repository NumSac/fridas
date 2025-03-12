import { Column, Entity, OneToMany } from 'typeorm';
import { BaseUser } from './base-user.entity';
import { ListenerEntity } from '../../listeners/entities/listener.entity';

export enum Role {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

@Entity('user') // Set table name to 'user'
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

  @Column({
    type: 'enum',
    enum: Role,
    array: false,
    default: [Role.OPERATOR]
  })
  role: Role;

  @OneToMany(() => ListenerEntity, (listener) => listener.user)
  listeners?: ListenerEntity[]; // Renamed to plural for clarity
}