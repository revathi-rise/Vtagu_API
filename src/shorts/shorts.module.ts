import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortsService } from './shorts.service';
import { ShortsController } from './shorts.controller';
import { Short } from './short.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Short, Subscription, Plan, User])],
  providers: [ShortsService],
  controllers: [ShortsController],
  exports: [ShortsService],
})
export class ShortsModule {}
