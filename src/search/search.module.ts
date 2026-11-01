import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Movie } from '../movies/movie.entity';
import { Series } from '../series/entities/series.entity';
import { Episode } from '../episodes/episode.entity';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { Short } from '../shorts/short.entity';
import { Genre } from '../genres/genre.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      Series,
      Episode,
      InteractiveMovie,
      Short,
      Genre,
      User,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
