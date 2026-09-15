import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSubscription } from './entities/users-subscription.entity';
import { WatchSessionLog } from './entities/watch-session-log.entity';
import { TitleLedger } from './entities/title-ledger.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Movie } from '../movies/movie.entity';
import { Episode } from '../episodes/episode.entity';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { SvodRevenueService } from './svod-revenue.service';
import { TrackingController } from './controllers/tracking.controller';
import { RevenueController } from './controllers/revenue.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersSubscription,
      WatchSessionLog,
      TitleLedger,
      Subscription,
      Movie,
      Episode,
      InteractiveMovie,
    ]),
  ],
  controllers: [TrackingController, RevenueController],
  providers: [SvodRevenueService],
  exports: [SvodRevenueService],
})
export class SvodRevenueModule {}
