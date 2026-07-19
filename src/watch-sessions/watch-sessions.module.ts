import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchSession } from './entities/watch-session.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';
import { WatchSessionsService } from './watch-sessions.service';
import { WatchSessionsController } from './watch-sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WatchSession, Subscription, Plan])],
  providers: [WatchSessionsService],
  controllers: [WatchSessionsController],
  exports: [WatchSessionsService],
})
export class WatchSessionsModule {}
