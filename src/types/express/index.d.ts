import { UserEntity } from '../../modules/user/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;

      flash(type: 'success' | 'error', message?: string): string[];
    }
  }
}
