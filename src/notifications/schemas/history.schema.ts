import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Notification } from './notification.schema';

export type HistoryDocument = HydratedDocument<History>;

@Schema()
export class History {
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  company_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' })
  notification: Notification;

  @Prop({ required: true })
  created_by: string;

  @Prop({ required: true })
  created_at: Date;
}

export const HistorySchema = SchemaFactory.createForClass(History);
