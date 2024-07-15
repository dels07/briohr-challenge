import { Injectable } from '@nestjs/common';
import { companiesMocks } from './companies.mock';

export type NotificationChannel = {
  id: string;
  subscribed: boolean;
};

export type Company = {
  id: string;
  name: string;
  notification_channels: NotificationChannel[];
};

export interface CompaniesServiceInterface {
  findOne(id: string): Company;
}

@Injectable()
export class CompaniesService implements CompaniesServiceInterface {
  private readonly companies: Company[] = companiesMocks;

  findOne(id: string) {
    return this.companies.find((company) => company.id === id);
  }
}
