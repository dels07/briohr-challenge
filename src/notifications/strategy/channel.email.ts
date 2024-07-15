import { Company } from 'src/companies/companies.service';
import { User } from 'src/users/users.service';

export class EmailChannel {
  private user: User;
  private company: Company;

  constructor(user, company) {
    this.user = user;
    this.company = company;
  }

  send(subject: string, content?: string) {
    console.log({
      channel: 'email',
      user_id: this.user.id,
      company_id: this.company.id,
      subject,
      content,
    });
  }
}
