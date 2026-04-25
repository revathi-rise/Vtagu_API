import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InteractiveMovie } from './entities/interactive-movie.entity';

@Injectable()
export class InteractiveMoviesService {
  constructor(
    @InjectRepository(InteractiveMovie)
    private moviesRepository: Repository<InteractiveMovie>,
  ) {}

  async findAll(): Promise<InteractiveMovie[]> {
    return this.moviesRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }
}
