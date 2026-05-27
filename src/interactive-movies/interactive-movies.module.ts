import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractiveMoviesService } from './interactive-movies.service';
import { InteractiveMoviesController } from './interactive-movies.controller';
import { InteractiveMovie } from './entities/interactive-movie.entity';
import { Scene } from '../scenes/entities/scene.entity';
import { Choice } from '../choices/entities/choice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InteractiveMovie, Scene, Choice])],
  providers: [InteractiveMoviesService],
  controllers: [InteractiveMoviesController]
})
export class InteractiveMoviesModule {}
