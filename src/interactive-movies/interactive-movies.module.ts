import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractiveMoviesService } from './interactive-movies.service';
import { InteractiveMoviesController } from './interactive-movies.controller';
import { InteractiveMovie } from './entities/interactive-movie.entity';
import { Scene } from '../scenes/entities/scene.entity';
import { Choice } from '../choices/entities/choice.entity';
import { UserInteractiveMoviePurchase } from './entities/user-purchase.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    InteractiveMovie, 
    Scene, 
    Choice, 
    UserInteractiveMoviePurchase, 
    Subscription, 
    Plan
  ])],
  providers: [InteractiveMoviesService],
  controllers: [InteractiveMoviesController]
})
export class InteractiveMoviesModule {}

