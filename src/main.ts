import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  mongoose.set('debug', process.env.MONGOOSE_DEBUG === 'true');
  await app.listen(3000);
}
bootstrap();
