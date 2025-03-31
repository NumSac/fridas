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

export type SSLConfig = {
  keyPath: string;
  certPath: string;
  caPath?: string;
  passphrase?: string;
  rejectUnauthorized?: boolean;
};

export type ListenerOptions = {
  ssl?: SSLConfig;
  authenticationRequired?: boolean;
  maxConnections?: number;
  whitelistIps?: string[];
};

@Entity({ name: 'listener' })
export class ListenerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  name: string;

  @Column({
    type: 'enum',
    enum: Protocol,
    default: Protocol.HTTP,,
  })
  protocol: Protocol;

  @Column({ type: 'smallint', unsigned: true })
  @Index()
  port: number;

  @Column({
    type: 'enum',
    enum: ListenerStatus,
    default: ListenerStatus.INACTIVE,
  })
  status: ListenerStatus;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'SSL config, auth requirements, and connection limits',
  })
  options: ListenerOptions;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.listeners, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  // Virtual field for runtime usage (not persisted)
  connectionCount?: number;
}