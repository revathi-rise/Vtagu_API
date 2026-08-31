import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Movie } from '../movies/movie.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Genre } from '../genres/genre.entity';
import { Series } from '../series/entities/series.entity';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { Short } from '../shorts/short.entity';
import { MoviesModule } from '../movies/movies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Movie, Subscription, Genre, Series, InteractiveMovie, Short]),
    MoviesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
