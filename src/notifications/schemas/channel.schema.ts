import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChannelDocument = HydratedDocument<Channel>;

@Schema()
export class Channel {
  @Prop({ required: true })
  type: string;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
