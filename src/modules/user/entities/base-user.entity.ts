import { PrimaryGeneratedColumn } from 'typeorm';

export class BaseUser {
  @PrimaryGeneratedColumn()
  id: number;
}
