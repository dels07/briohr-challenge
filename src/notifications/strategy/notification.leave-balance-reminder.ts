import { Company } from 'src/companies/companies.service';
import { User } from 'src/users/users.service';

export class LeaveReminderNotification {
  private user: User;
  private company: Company;

  constructor(user, company) {
    this.user = user;
    this.company = company;
  }

  create() {
    return {
      subject: `Yearly on leave reminder for ${this.user.first_name}`,
      content: `${this.company.name} want to remind that you need to book your on leave!`,
    };
  }
}
