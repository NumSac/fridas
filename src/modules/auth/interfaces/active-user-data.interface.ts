import { Role } from '../../user/entities/user.entity';

export interface ActiveUserData {
  sub: number;
  email: string;
  role: Role;
  username?: string;  // Optional if you want to include username
}