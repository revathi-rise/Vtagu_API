import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodesController } from './episodes.controller';
import { EpisodesService } from './episodes.service';
import { Episode } from './episode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Episode])],
  controllers: [EpisodesController],
  providers: [EpisodesService],
})
export class EpisodesModule {}
