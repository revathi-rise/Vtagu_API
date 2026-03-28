import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractiveMoviesService } from './interactive-movies.service';
import { InteractiveMoviesController } from './interactive-movies.controller';
import { InteractiveMovie } from './interactive-movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InteractiveMovie])],
  providers: [InteractiveMoviesService],
  controllers: [InteractiveMoviesController],
})
export class InteractiveMoviesModule {}
