import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InteractiveMovie } from './interactive-movie.entity';

@Injectable()
export class InteractiveMoviesService {
  constructor(
    @InjectRepository(InteractiveMovie)
    private repo: Repository<InteractiveMovie>,
  ) { }

  findAll(): Promise<InteractiveMovie[]> {
    return this.repo.find({ order: { interactive_movie_id: 'DESC' } });
  }

  // Provide a small set for the homepage (e.g., top 10 latest)
  findForHome(limit = 10): Promise<InteractiveMovie[]> {
    return this.repo.find({ order: { interactive_movie_id: 'DESC' }, take: limit });
  }

  create(data: Partial<InteractiveMovie>) {
    const m = this.repo.create(data as any);
    return this.repo.save(m);
  }
}
