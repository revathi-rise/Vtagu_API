import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenesService } from './scenes.service';
import { ScenesController } from './scenes.controller';
import { Scene } from './entities/scene.entity';
import { Choice } from '../choices/entities/choice.entity';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { UserInteractiveMoviePurchase } from '../interactive-movies/entities/user-purchase.entity';
import { User } from '../users/entities/user.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scene, Choice, InteractiveMovie, UserInteractiveMoviePurchase, User, Subscription, Plan])],
  providers: [ScenesService],
  controllers: [ScenesController],
})
export class ScenesModule {}
