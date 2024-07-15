import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UsersServiceInterface } from 'src/users/users.service';
import { CompaniesServiceInterface } from 'src/companies/companies.service';
import { NotificationsRepositoryInterface } from './notifications.repository';
import { NotificationStrategyInterface } from './strategy/notification.strategy.interface';
import { LeaveReminderNotification } from './strategy/notification.leave-balance-reminder';
import { HappyBirthdayNotification } from './strategy/notification.happy-birthday';
import { MonthlyPayslipNotification } from './strategy/notification.monthly-payslip';
import { EmailChannel } from './strategy/channel.email';
import { UIOnlyChannel } from './strategy/channel.ui-only';
import { HistoriesRepositoryInterface } from './histories.repository';
import { History } from './schemas/history.schema';
import { ChannelsRepositoryInterface } from './channels.repository';

export interface NotificationsServiceInterface {
  getHistories(userId: string): Promise<History[]>;
  create(
    userId: string,
    companyId: string,
    notificationType: string,
  ): Promise<void>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private notificationStrategy: NotificationStrategyInterface;
  private channelStrategy: any;

  constructor(
    @Inject('NotificationsRepositoryInterface')
    private notificationRepository: NotificationsRepositoryInterface,
    @Inject('ChannelsRepositoryInterface')
    private channelRepository: ChannelsRepositoryInterface,
    @Inject('HistoriesRepositoryInterface')
    private historiesRepository: HistoriesRepositoryInterface,
    @Inject('UsersServiceInterface')
    private usersService: UsersServiceInterface,
    @Inject('CompaniesServiceInterface')
    private companiesService: CompaniesServiceInterface,
  ) {}

  async getHistories(userId: string): Promise<History[]> {
    return await this.historiesRepository.findAll(userId);
  }

  async create(
    userId: string,
    companyId: string,
    notificationType: string,
  ): Promise<void> {
    const { user, company } = this.getUserAndCompany(userId, companyId);
    const notification = await this.getNotification(notificationType);
    const channelIds = this.getNotificationChannels(
      user,
      company,
      notification,
    );

    this.setNotificationStrategy(user, company, notificationType);
    const { subject, content } = this.notificationStrategy.create();

    const channels = await this.channelRepository.findAll(channelIds);

    channels.forEach((channel) => {
      this.setChannelStrategy(user, company, channel.type);
      this.channelStrategy.send(subject, content);
    });
  }

  private setNotificationStrategy(user, company, notificationType) {
    switch (notificationType) {
      case 'happy-birthday':
        this.notificationStrategy = new HappyBirthdayNotification(
          user,
          company,
        );
        break;
      case 'monthly-payslip':
        this.notificationStrategy = new MonthlyPayslipNotification(
          user,
          company,
        );
        break;
      case 'leave-balance-reminder':
        this.notificationStrategy = new LeaveReminderNotification(
          user,
          company,
        );
        break;
      default:
        throw new HttpException(
          'notification type not found',
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private setChannelStrategy(user, company, channelType) {
    switch (channelType) {
      case 'email':
        this.channelStrategy = new EmailChannel(user, company);
        break;
      case 'ui-only':
        this.channelStrategy = new UIOnlyChannel(
          user,
          company,
          this.historiesRepository,
        );
        break;
      default:
        throw new HttpException(
          'channel type not found',
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private getUserAndCompany(userId: string, companyId: string) {
    const user = this.usersService.findOne(userId);

    if (!user) {
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    }

    const company = this.companiesService.findOne(companyId);

    if (!company) {
      throw new HttpException('company not found', HttpStatus.BAD_REQUEST);
    }

    return { user, company };
  }

  private async getNotification(notificationType: string) {
    const notification =
      await this.notificationRepository.findOneByType(notificationType);

    if (!notification) {
      throw new HttpException(
        'notification type not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    return notification;
  }

  private findMatchingChannels(channels: any[], notificationChannels: any[]) {
    if (!channels || channels.length === 0) {
      return [];
    }
    const notificationChannelIdSet = new Set(
      notificationChannels.map((nc) => nc._id),
    );

    return channels
      .filter(
        (channel) =>
          channel.subscribed && notificationChannelIdSet.has(channel.id),
      )
      .map((channel) => channel.id);
  }

  private getNotificationChannels(user, company, notification) {
    let matchingChannels = this.findMatchingChannels(
      user.notification_channels,
      notification.channels,
    );

    if (matchingChannels.length === 0 && company) {
      matchingChannels = this.findMatchingChannels(
        company.notification_channels,
        notification.channels,
      );
    }

    if (!matchingChannels || matchingChannels.length === 0) {
      throw new HttpException(
        'user and company not subscribed to channels for this notification',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return matchingChannels;
  }
}
