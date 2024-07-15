import { Company } from 'src/companies/companies.service';
import { User } from 'src/users/users.service';

export class HappyBirthdayNotification {
  private user: User;
  private company: Company;

  constructor(user, company) {
    this.user = user;
    this.company = company;
  }

  create() {
    return {
      subject: `Happy birthday ${this.user.first_name}`,
      content: `${this.company.name} wishes you a happy birthday!`,
    };
  }
}
