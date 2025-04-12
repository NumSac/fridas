import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum AgentPlatform {
  WINDOWS = 'windows',
  LINUX = 'linux',
  MACOS = 'macos',
  ANDROID = 'android',
  IOS = 'ios',
  UNKNOWN = 'unknown',
}

export enum AgentArchitecture {
  X86 = 'x86',
  X64 = 'x64',
  ARM = 'arm',
  ARM64 = 'arm64',
}

export enum AgentStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
  COMPROMISED = 'compromised',
}

@Entity('agents')
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  hostname: string;

  @Column({ name: 'ip_address' })
  @Index()
  ipAddress: string;

  @Column({
    type: 'enum',
    enum: AgentPlatform,
    default: AgentPlatform.UNKNOWN,
  })
  platform: AgentPlatform;

  @Column({
    type: 'enum',
    enum: AgentArchitecture,
    nullable: true,
  })
  architecture: AgentArchitecture;

  @Column({ name: 'check_in_interval', default: 60 })
  checkInInterval: number; // Seconds

  @Column({ name: 'last_check_in', type: 'timestamp' })
  @Index()
  lastCheckIn: Date;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.OFFLINE,
  })
  @Index()
  status: AgentStatus;

  @Column({ name: 'agent_version', length: 20 })
  agentVersion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'auth_token', length: 255 })
  authToken: string;

  @Column({ name: 'user_context', length: 255, nullable: true })
  userContext: string;

  @Column({ name: 'persistence_method', length: 100, nullable: true })
  persistenceMethod: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @BeforeInsert()
  async hashAuthToken() {
    if (this.authToken) {
      this.authToken = await bcrypt.hash(this.authToken, 10);
    }
  }

  // Helper methods
  public async validateAuthToken(token: string): Promise<boolean> {
    return bcrypt.compare(token, this.authToken);
  }

  public isActive(): boolean {
    return (
      this.status === AgentStatus.ONLINE || this.status === AgentStatus.BUSY
    );
  }

  public needsCheckIn(): boolean {
    const secondsSinceCheckIn =
      (Date.now() - this.lastCheckIn.getTime()) / 1000;
    return secondsSinceCheckIn > this.checkInInterval * 2;
  }
}
