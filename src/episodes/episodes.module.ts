import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodesController } from './episodes.controller';
import { EpisodesService } from './episodes.service';
import { Episode } from './episode.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Episode, Subscription, Plan])],
  controllers: [EpisodesController],
  providers: [EpisodesService],
  exports: [EpisodesService],
})
export class EpisodesModule {}
