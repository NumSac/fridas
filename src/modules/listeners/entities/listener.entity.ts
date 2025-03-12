 // src/listeners/entities/listener.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { ListenerStatus, Protocol } from '../enums/listener.enum';
import { UserEntity } from '../../user/entities/user.entity';

type ListenerOptions = {
  ssl?: {
    keyPath: string;
    certPath: string;
    caPath?: string;
    passphrase?: string;
    rejectUnauthorized?: boolean;
  };
  authenticationRequired?: boolean;
  maxConnections?: number;
  whitelistIps?: string[];
};

@Entity({ name: "listener" })
export class ListenerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ type: 'enum', enum: Protocol, default: Protocol.HTTP })
  protocol: Protocol;

  @Column()
  @Index()
  port: number;

  @Column({
    type: 'enum',
    enum: ListenerStatus,
    default: ListenerStatus.INACTIVE,
  })
  status: ListenerStatus;

  @Column({ default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  options: ListenerOptions;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual column for active connections (not stored in DB)
  connectionCount?: number;

  // Owner basically. Each listener belongs to the user who created it
  @ManyToOne(() => UserEntity, (user) => user.listeners)
  user: UserEntity;
}
