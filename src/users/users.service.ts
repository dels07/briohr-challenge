import { Injectable } from '@nestjs/common';
import { userMocks } from './users.mock';

export type NotificationChannel = {
  id: string;
  subscribed: boolean;
};

export type User = {
  id: string;
  company_id: string;
  first_name: string;
  notification_channels: NotificationChannel[];
};

export interface UsersServiceInterface {
  findOne(id: string): User;
}

@Injectable()
export class UsersService implements UsersServiceInterface {
  private readonly users: User[] = userMocks;

  findOne(id: string): User {
    return this.users.find((user) => user.id === id);
  }
}
