import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchProgressService } from './watch-progress.service';
import { WatchProgressController } from './watch-progress.controller';
import { WatchProgress } from './entities/watch-progress.entity';
import { Movie } from '../movies/movie.entity';
import { Episode } from '../episodes/episode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WatchProgress, Movie, Episode])],
  controllers: [WatchProgressController],
  providers: [WatchProgressService],
  exports: [WatchProgressService],
})
export class WatchProgressModule {}
