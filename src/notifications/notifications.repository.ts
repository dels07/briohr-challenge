import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schemas/notification.schema';
import { Model } from 'mongoose';

export interface NotificationsRepositoryInterface {
  findOneByType(notificationType: string): Promise<Notification>;
}

@Injectable()
export class NotificationsRepository
  implements NotificationsRepositoryInterface
{
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async findOneByType(notificationType: string): Promise<Notification> {
    return await this.notificationModel
      .findOne({ type: notificationType })
      // .populate('channels')
      .lean()
      .exec();
  }
}
