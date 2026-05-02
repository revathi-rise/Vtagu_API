import 'dotenv/config';
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
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
import { WatchProgressModule } from './watch-progress/watch-progress.module';
import { WatchProgress } from './watch-progress/entities/watch-progress.entity';
import { PlansModule } from './plans/plans.module';
import { Plan } from './plans/entities/plan.entity';
import { ActorsModule } from './actors/actors.module';
import { Actor } from './actors/entities/actor.entity';
import { DirectorsModule } from './directors/directors.module';
import { Director } from './directors/entities/director.entity';
import { FaqsModule } from './faqs/faqs.module';
import { Faq } from './faqs/entities/faq.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/entities/transaction.entity';
import { SeriesModule } from './series/series.module';
import { Series } from './series/entities/series.entity';
import { NewsModule } from './news/news.module';
import { News } from './news/entities/news.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'vtaqu',
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
        WatchProgress,
        Plan,
        Actor,
        Director,
        Faq,
        Transaction,
        Series,
        News,
      ],
      synchronize: false,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT),
        secure: parseInt(process.env.MAIL_PORT) === 465, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false, // Helps with some shared hosting certificates
        },
      },
      defaults: {
        from: `"VTAGU PrimeTime" <${process.env.MAIL_FROM}>`,
      },
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
    WatchProgressModule,
    PlansModule,
    ActorsModule,
    DirectorsModule,
    FaqsModule,
    TransactionsModule,
    SeriesModule,
    NewsModule,
  ],
})
export class AppModule {}
