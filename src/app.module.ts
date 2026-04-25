import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from './movies/movies.module';
import { PostersModule } from './posters/posters.module';
import { ChoicesModule } from './choices/choices.module';
import { ScenesModule } from './scenes/scenes.module';
import { Movie } from './movies/movie.entity';
import { Poster } from './posters/poster.entity';
import { Choice } from './choices/entities/choice.entity';
import { Scene } from './scenes/entities/scene.entity';
import { InteractiveMoviesModule } from './interactive-movies/interactive-movies.module';
import { InteractiveMovie } from './interactive-movies/entities/interactive-movie.entity';
import { GenresModule } from './genres/genres.module';
import { Genre } from './genres/genre.entity';
import { Content } from './content/entities/content.entity';
import { ContentModule } from './content/content.module';
import { EpisodesModule } from './episodes/episodes.module';
import { Episode } from './episodes/episode.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { Subscription } from './subscriptions/entities/subscription.entity';
import { UserDevicesModule } from './user-devices/user-devices.module';
import { UserDevice } from './user-devices/entities/user-device.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'vtagu',
      entities: [
        Movie,
        Poster,
        Genre,
        Content,
        Scene,
        Choice,
        InteractiveMovie,
        Episode,
        User,
        Subscription,
        UserDevice,
      ],
      synchronize: false,
    }),
    MoviesModule,
    PostersModule,
    ChoicesModule,
    ScenesModule,
    GenresModule,
    ContentModule,
    InteractiveMoviesModule,
    EpisodesModule,
    UsersModule,
    SubscriptionsModule,
    UserDevicesModule,
  ],
})
export class AppModule {}
