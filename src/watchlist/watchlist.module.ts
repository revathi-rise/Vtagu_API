import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchlistService } from './watchlist.service';
import { WatchlistController } from './watchlist.controller';
import { Watchlist } from './entities/watchlist.entity';
import { Movie } from '../movies/movie.entity';
import { Series } from '../series/entities/series.entity';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { Short } from '../shorts/short.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Watchlist, Movie, Series, InteractiveMovie, Short]),
  ],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
