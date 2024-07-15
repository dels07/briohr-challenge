import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channel } from './schemas/channel.schema';

export interface ChannelsRepositoryInterface {
  findAll(channelIds: string[]): Promise<Channel[]>;
}

@Injectable()
export class ChannelsRepository implements ChannelsRepositoryInterface {
  constructor(
    @InjectModel(Channel.name)
    private channelModel: Model<Channel>,
  ) {}

  async findAll(channelIds: string[]): Promise<Channel[]> {
    return await this.channelModel.find({ _id: { $in: channelIds } }).exec();
  }
}
