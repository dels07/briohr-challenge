import { Company } from 'src/companies/companies.service';
import { User } from 'src/users/users.service';

export class MonthlyPayslipNotification {
  private user: User;
  private company: Company;

  constructor(user, company) {
    this.user = user;
    this.company = company;
  }

  create() {
    return {
      subject: `${this.user.first_name}, your payslip is ready!`,
      content: `${this.company.name} payslip for this month is ready to be downloaded!`,
    };
  }
}
