import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './language.entity';
import { Movie } from '../movies/movie.entity';
import { MoviesModule } from '../movies/movies.module';
import { Episode } from '../episodes/episode.entity';
import { EpisodesModule } from '../episodes/episodes.module';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Language, Movie, Episode, InteractiveMovie]),
    MoviesModule,
    EpisodesModule,
  ],
  providers: [LanguagesService],
  controllers: [LanguagesController],
  exports: [LanguagesService],
})
export class LanguagesModule {}
