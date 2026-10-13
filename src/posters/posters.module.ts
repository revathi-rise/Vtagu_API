import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostersController } from './posters.controller';
import { PostersService } from './posters.service';
import { Poster } from './poster.entity';
import { Movie } from '../movies/movie.entity';
import { Series } from '../series/entities/series.entity';
import { Episode } from '../episodes/episode.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poster, Movie, Series, Episode, User])],
  controllers: [PostersController],
  providers: [PostersService],
  exports: [PostersService],
})
export class PostersModule {}
