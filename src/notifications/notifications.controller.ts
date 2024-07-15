import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { NotificationsServiceInterface } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationsController {
  private logger = new Logger(NotificationsController.name);
  constructor(
    @Inject('NotificationServiceInterface')
    private readonly notificationsService: NotificationsServiceInterface,
  ) {}

  @Get('histories/:userId')
  async history(@Param('userId') userId: string) {
    try {
      const histories = await this.notificationsService.getHistories(userId);

      return {
        statusCode: 200,
        message: 'successfully retrieved histories',
        data: histories,
      };
    } catch (error) {
      this.logger.error(error.message);

      throw error;
    }
  }

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    try {
      const { user_id, company_id, notification_type } = createNotificationDto;

      await this.notificationsService.create(
        user_id,
        company_id,
        notification_type,
      );

      return {
        statusCode: 201,
        message: 'successfully created notification',
        data: [],
      };
    } catch (error) {
      this.logger.error(error.message);

      throw error;
    }
  }
}
