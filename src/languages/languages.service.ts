import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Language } from './language.entity';
import { Movie } from '../movies/movie.entity';
import { MoviesService } from '../movies/movies.service';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private readonly languagesRepo: Repository<Language>,
    @InjectRepository(Movie)
    private readonly moviesRepo: Repository<Movie>,
    private readonly moviesService: MoviesService,
  ) {}

  async findAll() {
    const languages = await this.languagesRepo.find({ order: { id: 'ASC' } });
    return languages.map(l => ({
      name: l.name,
      code: l.code,
      slug: l.slug,
    }));
  }

  async getMovies(slug: string) {
    // Find the language by its slug
    const language = await this.languagesRepo.findOne({ where: { slug } });
    if (!language) {
      throw new NotFoundException(`Language with slug "${slug}" not found`);
    }

    // Query movies that match the language name in their comma-separated languages field
    const movies = await this.moviesRepo.find({
      where: {
        languages: Like(`%${language.name}%`),
      },
      order: {
        movie_id: 'DESC',
      },
    });

    return {
      language: language.name,
      movies: movies.map(m => this.moviesService.mapToResponse(m)),
    };
  }
}
