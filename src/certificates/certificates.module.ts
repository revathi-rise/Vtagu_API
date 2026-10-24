import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { Movie } from '../movies/movie.entity';
import { Episode } from '../episodes/episode.entity';
import { Series } from '../series/entities/series.entity';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { Poster } from '../posters/poster.entity';
import { User } from '../users/entities/user.entity';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, Movie, Episode, Series, InteractiveMovie, Poster, User])],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
