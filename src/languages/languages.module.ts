import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './language.entity';
import { Movie } from '../movies/movie.entity';
import { MoviesModule } from '../movies/movies.module';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Language, Movie]),
    MoviesModule,
  ],
  providers: [LanguagesService],
  controllers: [LanguagesController],
  exports: [LanguagesService],
})
export class LanguagesModule {}
