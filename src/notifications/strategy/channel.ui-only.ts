import { Company } from 'src/companies/companies.service';
import { User } from 'src/users/users.service';
import { HistoriesRepositoryInterface } from '../histories.repository';

export class UIOnlyChannel {
  private user: User;
  private company: Company;
  private historyRepository: HistoriesRepositoryInterface;

  constructor(user, company, historyRepository) {
    this.user = user;
    this.company = company;
    this.historyRepository = historyRepository;
  }

  async send(subject: string, content?: string) {
    await this.saveHistory();

    console.log({
      channel: 'ui-only',
      user_id: this.user.id,
      company_id: this.company.id,
      content: subject,
    });
  }

  private async saveHistory() {
    await this.historyRepository.create({
      user_id: this.user.id,
      company_id: this.company.id,
      notification: null,
      created_at: new Date(),
      created_by: 'system',
    });
  }
}
