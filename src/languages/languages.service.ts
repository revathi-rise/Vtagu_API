import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Language } from './language.entity';
import { Movie } from '../movies/movie.entity';
import { MoviesService } from '../movies/movies.service';
import { Episode } from '../episodes/episode.entity';
import { EpisodesService } from '../episodes/episodes.service';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private readonly languagesRepo: Repository<Language>,
    @InjectRepository(Movie)
    private readonly moviesRepo: Repository<Movie>,
    @InjectRepository(Episode)
    private readonly episodesRepo: Repository<Episode>,
    @InjectRepository(InteractiveMovie)
    private readonly interactiveMoviesRepo: Repository<InteractiveMovie>,
    private readonly moviesService: MoviesService,
    private readonly episodesService: EpisodesService,
  ) {}

  async findAll(includeHidden = false) {
    const where = includeHidden ? {} : { is_visible: true };
    const languages = await this.languagesRepo.find({ where, order: { id: 'ASC' } });
    return languages.map(l => ({
      id: l.id,
      name: l.name,
      code: l.code,
      slug: l.slug,
      is_visible: l.is_visible,
    }));
  }

  async create(dto: { name: string; code: string; slug?: string; is_visible?: boolean }) {
    const slug = dto.slug || dto.name.toLowerCase().trim().replace(/\s+/g, '-');
    const language = this.languagesRepo.create({
      name: dto.name,
      code: dto.code,
      slug,
      is_visible: dto.is_visible !== undefined ? dto.is_visible : true,
    });
    return this.languagesRepo.save(language);
  }

  async update(id: number, dto: { name?: string; code?: string; slug?: string; is_visible?: boolean }) {
    const language = await this.languagesRepo.findOne({ where: { id } });
    if (!language) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }

    if (dto.slug === undefined && dto.name !== undefined) {
      dto.slug = dto.name.toLowerCase().trim().replace(/\s+/g, '-');
    }

    Object.assign(language, dto);
    return this.languagesRepo.save(language);
  }

  async remove(id: number) {
    const language = await this.languagesRepo.findOne({ where: { id } });
    if (!language) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }
    await this.languagesRepo.remove(language);
    return { status: true, message: 'Language deleted successfully' };
  }

  async getMovies(slug: string) {
    // Find the language by its slug
    const language = await this.languagesRepo.findOne({ where: { slug } });
    if (!language) {
      throw new NotFoundException(`Language with slug "${slug}" not found`);
    }

    // 1. Query standard movies that match the language name
    const movies = await this.moviesRepo.find({
      where: {
        languages: Like(`%${language.name}%`),
      },
      order: {
        movie_id: 'DESC',
      },
    });

    // 2. Query interactive movies that match the language name
    const interactiveMovies = await this.interactiveMoviesRepo.find({
      where: {
        languages: Like(`%${language.name}%`),
      },
      order: {
        interactive_movie_id: 'DESC',
      },
    });

    // 3. Query episodes that match the language name
    const episodes = await this.episodesRepo.find({
      where: {
        languages: Like(`%${language.name}%`),
      },
      order: {
        episode_id: 'DESC',
      },
    });

    return {
      status: true,
      message: 'Movies, interactive movies and episodes fetched successfully',
      data: {
        language: language.name,
        movies: movies.map(m => this.moviesService.mapToResponse(m)),
        Interactive: interactiveMovies,
        episodes: episodes.map(e => this.episodesService.mapToResponse(e)),
      }
    };
  }
}
