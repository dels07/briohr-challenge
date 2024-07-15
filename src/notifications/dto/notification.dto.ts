import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum NotificationType {
  LEAVE_BALANCE_REMINDER = 'leave-balance-reminder',
  MONTHLY_PAYSLIP = 'monthly-payslip',
  HAPPY_BIRTHDAY = 'happy-birthday',
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  company_id: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  notification_type: string;
}
