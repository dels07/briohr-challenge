import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History } from './schemas/history.schema';

export interface HistoriesRepositoryInterface {
  findAll(userId: string): Promise<History[]>;
  create(history: History): Promise<History>;
}

@Injectable()
export class HistoriesRepository implements HistoriesRepositoryInterface {
  constructor(
    @InjectModel(History.name)
    private historyModel: Model<History>,
  ) {}

  async findAll(userId: string): Promise<History[]> {
    return await this.historyModel
      .find({ user_id: userId })
      .populate({ path: 'notification', select: '-channels' })
      .exec();
  }

  async create(history: History): Promise<History> {
    return await this.historyModel.create(history);
  }
}
