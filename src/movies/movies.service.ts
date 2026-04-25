import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { CreateMovieDto, MovieResponseDto, UpdateMovieDto } from './movies.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepo: Repository<Movie>,
  ) { }

  async findAll(): Promise<MovieResponseDto[]> {
    const movies = await this.moviesRepo.find({ order: { movie_id: 'DESC' } });
    return movies.map(m => this.mapToResponse(m));
  }

  async findForHome(limit = 10): Promise<MovieResponseDto[]> {
    const movies = await this.moviesRepo.find({ order: { movie_id: 'DESC' }, take: limit });
    return movies.map(m => this.mapToResponse(m));
  }

  async findOneBySlug(slug: string): Promise<MovieResponseDto> {
    const movie = await this.moviesRepo.findOne({ where: { slug } });
    if (!movie) throw new NotFoundException('Movie not found');
    return this.mapToResponse(movie);
  }

  async create(dto: CreateMovieDto): Promise<MovieResponseDto> {
    const movieData = this.mapFromDto(dto);
    const movie = this.moviesRepo.create(movieData);
    const saved = await this.moviesRepo.save(movie);
    return this.mapToResponse(saved);
  }

  async update(id: number, dto: UpdateMovieDto): Promise<MovieResponseDto> {
    const movie = await this.moviesRepo.findOne({ where: { movie_id: id } });
    if (!movie) throw new NotFoundException('Movie not found');

    const updateData = this.mapFromDto(dto);
    Object.assign(movie, updateData);
    const updated = await this.moviesRepo.save(movie);
    return this.mapToResponse(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.moviesRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Movie not found');
  }

  private mapFromDto(dto: CreateMovieDto): Partial<Movie> {
    const { media, ...rest } = dto;
    const movie: Partial<Movie> = { ...rest };

    if (media) {
      if (media.image) {
        movie.movie_image = media.image.url;
        movie.poster_alt = media.image.alt;
      }
      if (media.video) {
        movie.trailer_url = media.video.url;
        movie.trailer_alt = media.video.alt;
      }
    }

    return movie;
  }

  private mapToResponse(m: Movie): MovieResponseDto {
    return {
      id: m.movie_id,
      title: m.title,
      slug: m.slug,
      shortDescription: m.description_short,
      longDescription: m.description_long,
      releaseYear: m.year,
      countryId: m.country_id,
      rating: m.rating ? parseFloat(m.rating.toString()) : null,
      genreId: m.genre_id,
      ageGroup: m.age_group,
      actors: m.actors,
      director: m.director,
      isFeatured: m.featured,
      isFree: m.free,
      movieType: m.movie_type,
      contentType: m.type,
      ageRestriction: m.age_restriction,
      kidsRestriction: m.kids_restriction,
      videoUrl: m.url,
      trailerUrl: m.trailer_url,
      trailerAlt: m.trailer_alt,
      posterImage: m.movie_image,
      posterAlt: m.poster_alt,
      duration: m.duration,
      languages: m.languages,
      viewCount: m.view_count,
      isInteractive: m.is_interactive,
      interactiveMap: m.interactive_map,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    };
  }
}
