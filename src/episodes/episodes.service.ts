import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Episode } from './episode.entity';
import { CreateEpisodeDto, UpdateEpisodeDto } from './episode.dto';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
  ) {}

  create(createEpisodeDto: CreateEpisodeDto) {
    const episode = this.episodeRepository.create(createEpisodeDto);
    return this.episodeRepository.save(episode);
  }

  findAll() {
    return this.episodeRepository.find();
  }

  findOne(id: number) {
    return this.episodeRepository.findOneBy({ episodeId: id });
  }

  update(id: number, updateEpisodeDto: UpdateEpisodeDto) {
    return this.episodeRepository.update(id, updateEpisodeDto);
  }

  remove(id: number) {
    return this.episodeRepository.delete(id);
  }
}
