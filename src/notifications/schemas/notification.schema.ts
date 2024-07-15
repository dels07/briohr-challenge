import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Channel } from './channel.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop()
  type: string;

  // @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }] })
  @Prop()
  channels: Channel[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
