import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepo: Repository<Movie>,
  ) {}

  findAll(): Promise<Movie[]> {
    return this.moviesRepo.find({ order: { id: 'DESC' } });
  }

  // Provide a small set for the homepage (e.g., top 10 latest)
  findForHome(limit = 10): Promise<Movie[]> {
    return this.moviesRepo.find({ order: { id: 'DESC' }, take: limit });
  }

  create(data: Partial<Movie>) {
    const m = this.moviesRepo.create(data as any);
    return this.moviesRepo.save(m);
  }
}
