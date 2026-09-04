import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Movie } from './movie.entity';
import { CreateMovieDto, MovieResponseDto, UpdateMovieDto } from './movies.dto';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

const parseBool = (val: any): boolean => {
  if (val === true || val === false) return val;
  if (val === 1 || val === '1' || val === 'true') return true;
  if (val === 0 || val === '0' || val === 'false') return false;
  return false;
};

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepo: Repository<Movie>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) { }

  async findAll(languageSlug?: string, userId?: number): Promise<MovieResponseDto[]> {
    let movies: Movie[];
    if (languageSlug) {
      movies = await this.moviesRepo.find({
        where: {
          languages: Like(`%${languageSlug}%`),
        },
        order: { movie_id: 'DESC' },
      });
    } else {
      movies = await this.moviesRepo.find({ order: { movie_id: 'DESC' } });
    }
    const hasSubAccess = userId ? await this.checkStandardAccess(userId) : false;
    return movies.map(m => {
      const isFree = parseBool(m.free);
      const hasAccess = isFree || hasSubAccess;
      const res = this.mapToResponse(m);
      if (!hasAccess && res.media && res.media.video) {
        res.media.video.url = "";
      }
      return res;
    });
  }

  async findForHome(limit = 10, userId?: number): Promise<MovieResponseDto[]> {
    const movies = await this.moviesRepo.find({ order: { movie_id: 'DESC' }, take: limit });
    const hasSubAccess = userId ? await this.checkStandardAccess(userId) : false;
    return movies.map(m => {
      const isFree = parseBool(m.free);
      const hasAccess = isFree || hasSubAccess;
      const res = this.mapToResponse(m);
      if (!hasAccess && res.media && res.media.video) {
        res.media.video.url = "";
      }
      return res;
    });
  }

  async checkStandardAccess(userId?: number): Promise<boolean> {
    if (!userId) return false;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const activeSubs = await this.subscriptionRepository.find({
      where: { userId, status: 1 },
    });
    for (const activeSub of activeSubs) {
      const isPaymentSuccess = activeSub.payment_status === 2;
      const isDateValid = activeSub.timestamp_from <= currentTimestamp && activeSub.timestamp_to >= currentTimestamp;

      if (isPaymentSuccess && isDateValid) {
        const plan = await this.planRepository.findOne({
          where: { planId: activeSub.planId },
        });
        if (plan) {
          const hasQuality = plan.quality && plan.quality.trim() !== '' && plan.quality.trim().toLowerCase() !== 'none';
          if (hasQuality) return true;
        }
      }
    }
    return false;
  }

  async findOneBySlug(slugOrId: string, userId?: number): Promise<MovieResponseDto> {
    let movie: Movie;
    if (!isNaN(Number(slugOrId))) {
      movie = await this.moviesRepo.findOne({ where: { movie_id: Number(slugOrId) } });
    }
    if (!movie) {
      movie = await this.moviesRepo.findOne({ where: { slug: slugOrId } });
    }
    if (!movie) throw new NotFoundException('Movie not found');
    
    const isFree = parseBool(movie.free);
    let hasAccess = isFree;
    if (!isFree && userId) {
      hasAccess = await this.checkStandardAccess(userId);
    }
    
    const response = this.mapToResponse(movie);
    if (!hasAccess) {
      if (response.media && response.media.video) {
        response.media.video.url = "";
      }
    }
    return response;
  }

  async create(dto: CreateMovieDto): Promise<MovieResponseDto> {
    const movieData = this.mapFromDto(dto);
    const movie = this.moviesRepo.create(movieData);
    const saved = await this.moviesRepo.save(movie);
    return this.mapToResponse(saved);
  }

  async update(id: number, dto: UpdateMovieDto): Promise<MovieResponseDto> {
    const existing = await this.moviesRepo.findOne({ where: { movie_id: id } });
    if (!existing) throw new NotFoundException('Movie not found');

    const updateData = this.mapFromDto(dto);
    delete (updateData as any).id;
    delete (updateData as any).movie_id;
    delete (updateData as any).createdAt;
    delete (updateData as any).updatedAt;
    delete (updateData as any).created_at;
    delete (updateData as any).updated_at;
    delete (updateData as any).genre_name;

    await this.moviesRepo.update({ movie_id: id }, updateData);
    const updated = await this.moviesRepo.findOne({ where: { movie_id: id } });
    return this.mapToResponse(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.moviesRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Movie not found');
  }

  async incrementView(id: number): Promise<void> {
    await this.moviesRepo.increment({ movie_id: id }, 'view_count', 1);
  }

  private mapFromDto(dto: CreateMovieDto): Partial<Movie> {
    const { media, movie_name, movie_desc, movie_poster, movie_trailer, movie_video, cast_name, director_name, rating, duration, release_date, free, isFree, is_free, featured, isFeatured, is_featured, ...rest } = dto as any;
    const movie: Partial<Movie> = { ...rest };

    const freeInput = free !== undefined ? free : (isFree !== undefined ? isFree : is_free);
    if (freeInput !== undefined) {
      movie.free = parseBool(freeInput);
    }

    const featuredInput = featured !== undefined ? featured : (isFeatured !== undefined ? isFeatured : is_featured);
    if (featuredInput !== undefined) {
      movie.featured = parseBool(featuredInput);
    }

    if (movie_name) movie.title = movie_name;
    if (movie_desc) movie.description_short = movie_desc;
    if (movie_poster) movie.movie_image = movie_poster;
    if (movie_trailer) movie.trailer_url = movie_trailer;
    if (movie_video) movie.url = movie_video;
    if (cast_name) movie.actors = cast_name;
    if (director_name) movie.director = director_name;
    if (rating) movie.rating = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (duration) movie.duration = duration;
    if (release_date) {
      const year = new Date(release_date).getFullYear();
      if (!isNaN(year)) movie.year = year;
    }

    if (dto.card_image) movie.card_image = dto.card_image;

    if (media) {
      if (media.image) {
        movie.movie_image = media.image.url;
        movie.poster_alt = media.image.alt;
      }
      if (media.card_image) {
        movie.card_image = media.card_image.url;
      }
      if (media.video) {
        movie.url = media.video.url;
      }
      if (media.trailer) {
        movie.trailer_url = media.trailer.url;
        movie.trailer_alt = media.trailer.alt;
      }
    }

    if (dto.subtitles !== undefined) movie.subtitles = dto.subtitles;
    if (dto.audio_tracks !== undefined) movie.audio_tracks = dto.audio_tracks;
    if (dto.is_coming_soon !== undefined) movie.is_coming_soon = dto.is_coming_soon;

    return movie;
  }

  public mapToResponse(m: Movie): MovieResponseDto {
    const isFreeBool = parseBool(m.free);
    const isFeaturedBool = parseBool(m.featured);

    return {
      id: m.movie_id,
      title: m.title,
      movie_name: m.title,
      slug: m.slug,
      shortDescription: m.description_short,
      movie_desc: m.description_short,
      longDescription: m.description_long,
      releaseYear: m.year,
      release_date: m.year ? `${m.year}-01-01` : null,
      countryId: m.country_id,
      rating: m.rating ? parseFloat(m.rating.toString()) : null,
      genreId: m.genre_id,
      genre_name: '',
      ageGroup: m.age_group,
      actors: m.actors,
      cast_name: m.actors,
      director: m.director,
      director_name: m.director,
      isFeatured: isFeaturedBool,
      featured: isFeaturedBool,
      isFree: isFreeBool,
      free: isFreeBool,
      is_free: isFreeBool,
      movieType: m.movie_type,
      contentType: m.type,
      ageRestriction: m.age_restriction,
      kidsRestriction: m.kids_restriction,
      duration: m.duration,
      languages: m.languages,
      viewCount: m.view_count,
      isInteractive: m.is_interactive,
      isComingSoon: m.is_coming_soon,
      is_coming_soon: m.is_coming_soon,
      interactiveMap: m.interactive_map,
      subtitles: m.subtitles,
      audio_tracks: m.audio_tracks,
      media: {
        image: { url: m.movie_image || '', alt: m.poster_alt || '' },
        card_image: { url: m.card_image || '', alt: '' },
        video: { url: m.url || '', alt: '' },
        trailer: { url: m.trailer_url || '', alt: m.trailer_alt || '' },
      },
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    };
  }
}
