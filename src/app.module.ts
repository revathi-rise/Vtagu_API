import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Users module removed — project uses Movies only
import { MoviesModule } from './movies/movies.module';
import { PostersModule } from './posters/posters.module';
import { InteractiveMoviesModule } from './interactive-movies/interactive-movies.module';
import { Movie } from './movies/movie.entity';
import { Poster } from './posters/poster.entity';
import { InteractiveMovie } from './interactive-movies/interactive-movie.entity';
import { GenresModule } from './genres/genres.module';
import { Genre } from './genres/genre.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'vtagu',
      entities: [Movie, Poster, InteractiveMovie, Genre],
      synchronize: false,
    }),
    MoviesModule,
    PostersModule,
    InteractiveMoviesModule,
    GenresModule,
  ],
})
export class AppModule {}
