import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from './schemas/channel.schema';
import { History, HistorySchema } from './schemas/history.schema';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { UsersService } from 'src/users/users.service';
import { CompaniesService } from 'src/companies/companies.service';
import { NotificationsRepository } from './notifications.repository';
import { HistoriesRepository } from './histories.repository';
import { ChannelsRepository } from './channels.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Channel.name, schema: ChannelSchema },
      { name: History.name, schema: HistorySchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    { provide: 'NotificationServiceInterface', useClass: NotificationsService },
    { provide: 'UsersServiceInterface', useClass: UsersService },
    { provide: 'CompaniesServiceInterface', useClass: CompaniesService },
    {
      provide: 'NotificationsRepositoryInterface',
      useClass: NotificationsRepository,
    },
    {
      provide: 'ChannelsRepositoryInterface',
      useClass: ChannelsRepository,
    },
    {
      provide: 'HistoriesRepositoryInterface',
      useClass: HistoriesRepository,
    },
  ],
})
export class NotificationsModule {}
