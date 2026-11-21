import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../movies/movie.entity';
import { Series } from '../series/entities/series.entity';
import { Episode } from '../episodes/episode.entity';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { Short } from '../shorts/short.entity';
import { Genre } from '../genres/genre.entity';
import { User } from '../users/entities/user.entity';
import { SearchQueryDto, SearchResponseData, SearchResultItem } from './dto/search-query.dto';
import { parseBool } from '../common/kids-mode.util';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Series)
    private readonly seriesRepo: Repository<Series>,
    @InjectRepository(Episode)
    private readonly episodeRepo: Repository<Episode>,
    @InjectRepository(InteractiveMovie)
    private readonly interactiveRepo: Repository<InteractiveMovie>,
    @InjectRepository(Short)
    private readonly shortRepo: Repository<Short>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private async isKidsModeActive(
    userId?: number,
    authHeader?: string,
    kidsQueryFlag?: boolean | string,
    kidsHeaderFlag?: boolean | string,
  ): Promise<boolean> {
    if (authHeader && typeof authHeader === 'string') {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const user = await this.userRepo.findOne({ where: { user_session: token } });
        if (user && parseBool(user.is_kids_mode)) return true;
      }
    }
    if (userId) {
      const user = await this.userRepo.findOne({ where: { userId } });
      if (user && parseBool(user.is_kids_mode)) return true;
    }
    if (kidsQueryFlag !== undefined && parseBool(kidsQueryFlag)) return true;
    if (kidsHeaderFlag !== undefined && parseBool(kidsHeaderFlag)) return true;
    return false;
  }

  async search(
    queryDto: SearchQueryDto,
    authHeader?: string,
    kidsHeader?: string,
  ): Promise<SearchResponseData> {
    const rawQuery = (queryDto.q || '').trim();
    const category = (queryDto.category || 'all').trim().toLowerCase();
    const limit = Math.min(Math.max(parseInt(queryDto.limit as string, 10) || 40, 1), 100);
    const parsedUserId = queryDto.userId ? parseInt(queryDto.userId, 10) : undefined;
    const isKids = await this.isKidsModeActive(parsedUserId, authHeader, queryDto.kidsMode, kidsHeader);

    // 1. Fetch all genres from database for dynamic name mapping
    const allGenres = await this.genreRepo.find({ order: { genre_id: 'ASC' } });
    const genreMap = new Map<string, string>();
    allGenres.forEach((g) => {
      if (g) {
        genreMap.set(String(g.genre_id), g.name);
        if (g.name) {
          genreMap.set(g.name.toLowerCase(), g.name);
        }
      }
    });

    // Helper to safely extract genre names from database value (string, number, array)
    const resolveGenres = (rawGenreIds?: any): string[] => {
      if (rawGenreIds === null || rawGenreIds === undefined || rawGenreIds === '') return [];
      let parts: string[] = [];
      if (Array.isArray(rawGenreIds)) {
        parts = rawGenreIds.map((p) => String(p).trim()).filter(Boolean);
      } else if (typeof rawGenreIds === 'string') {
        parts = rawGenreIds.split(',').map((p) => p.trim()).filter(Boolean);
      } else {
        parts = [String(rawGenreIds).trim()].filter(Boolean);
      }
      return parts.map((p) => genreMap.get(p) || genreMap.get(p.toLowerCase()) || p);
    };

    // 2. Determine target entities based on category filter
    let movieResults: SearchResultItem[] = [];
    let seriesResults: SearchResultItem[] = [];
    let interactiveResults: SearchResultItem[] = [];
    let shortResults: SearchResultItem[] = [];

    const isStandardType = [
      'all',
      'movie',
      'movies',
      'video',
      'videos',
      'series',
      'shows',
      'interactive',
      'short',
      'shorts',
    ].includes(category);
    const isGenreCategory = !isStandardType;

    const shouldSearchMovies =
      category === 'all' ||
      category === 'movie' ||
      category === 'movies' ||
      category === 'video' ||
      category === 'videos' ||
      isGenreCategory;
    const shouldSearchSeries =
      category === 'all' ||
      category === 'series' ||
      category === 'shows' ||
      isGenreCategory;
    const shouldSearchInteractive =
      category === 'all' ||
      category === 'interactive' ||
      category === 'video' ||
      category === 'videos' ||
      isGenreCategory;
    const shouldSearchShorts =
      category === 'all' ||
      category === 'shorts' ||
      category === 'short' ||
      category === 'video' ||
      category === 'videos' ||
      isGenreCategory;

    // Search term and matching genre ID detection from DB genres
    const term = `%${rawQuery}%`;
    const matchedGenreIds: string[] = [];
    if (rawQuery) {
      allGenres.forEach((g) => {
        if (g && g.name && g.name.toLowerCase().includes(rawQuery.toLowerCase())) {
          matchedGenreIds.push(String(g.genre_id));
        }
      });
    }

    // Category genre matching or explicit genre parameter
    let targetGenreId: string | null = null;
    const rawGenre = (queryDto.genre || '').trim().toLowerCase();
    if (rawGenre) {
      const g = allGenres.find(
        (item) => item && item.name && (item.name.toLowerCase() === rawGenre || String(item.genre_id) === rawGenre),
      );
      if (g) targetGenreId = String(g.genre_id);
    } else if (isGenreCategory) {
      const g = allGenres.find((item) => item && item.name && item.name.toLowerCase() === category);
      if (g) targetGenreId = String(g.genre_id);
    }

    // -------------------------------------------------------------
    // Query Movies from Database
    // -------------------------------------------------------------
    if (shouldSearchMovies) {
      const qb = this.movieRepo
        .createQueryBuilder('movie')
        .leftJoinAndSelect('movie.certificate', 'certificate');

      if (isKids) {
        qb.andWhere('(movie.kids_restriction = 1 OR movie.kids_only = 1)');
      } else {
        qb.andWhere('(movie.kids_only IS NULL OR movie.kids_only = 0)');
      }

      if (targetGenreId) {
        qb.andWhere(
          '(movie.genre_id = :catGenreId OR movie.genre_id LIKE :catGenrePatternStart OR movie.genre_id LIKE :catGenrePatternMid OR movie.genre_id LIKE :catGenrePatternEnd OR movie.genre_id LIKE :catNamePattern)',
          {
            catGenreId: targetGenreId,
            catGenrePatternStart: `${targetGenreId},%`,
            catGenrePatternMid: `%,${targetGenreId},%`,
            catGenrePatternEnd: `%,${targetGenreId}`,
            catNamePattern: `%${category}%`,
          },
        );
      }

      if (rawQuery) {
        let genreLikeClause = '';
        const genreLikeParams: Record<string, string> = {};
        if (matchedGenreIds.length > 0) {
          const conditions: string[] = ['movie.genre_id IN (:...matchedGenreIds)'];
          matchedGenreIds.forEach((gid, i) => {
            conditions.push(
              `movie.genre_id LIKE :mgS${i} OR movie.genre_id LIKE :mgM${i} OR movie.genre_id LIKE :mgE${i}`,
            );
            genreLikeParams[`mgS${i}`] = `${gid},%`;
            genreLikeParams[`mgM${i}`] = `%,${gid},%`;
            genreLikeParams[`mgE${i}`] = `%,${gid}`;
          });
          genreLikeClause = ` OR (${conditions.join(' OR ')})`;
        }

        const movieParams: any = { term };
        if (matchedGenreIds.length > 0) {
          movieParams.matchedGenreIds = matchedGenreIds;
          Object.assign(movieParams, genreLikeParams);
        }

        qb.andWhere(
          `(movie.title LIKE :term OR movie.slug LIKE :term OR movie.actors LIKE :term OR movie.director LIKE :term OR movie.description_short LIKE :term OR movie.description_long LIKE :term OR movie.languages LIKE :term OR movie.genre_id LIKE :term${genreLikeClause})`,
          movieParams,
        );
      }

      qb.orderBy('movie.view_count', 'DESC').addOrderBy('movie.movie_id', 'DESC').take(limit);

      const movies = await qb.getMany();
      movieResults = movies.map((m) => {
        const isVideoType =
          (m.movie_type && String(m.movie_type).toLowerCase() === 'video') ||
          (m.type && String(m.type).toLowerCase() === 'video');

        return {
          id: m.movie_id,
          title: m.title || '',
          type: (isVideoType ? 'video' : 'movie') as 'movie' | 'video',
          slug: m.slug || String(m.movie_id),
          image: m.card_image || m.movie_image || '',
          card_image: m.card_image || m.movie_image || '',
          description: m.description_short || m.description_long || '',
          year: m.year || null,
          rating: m.rating ? parseFloat(m.rating.toString()) : null,
          duration: m.duration || null,
          languages: m.languages || null,
          director: m.director || null,
          actors: m.actors || null,
          genres: resolveGenres(m.genre_id),
          genreIds: m.genre_id !== null && m.genre_id !== undefined ? String(m.genre_id) : null,
          isFree: parseBool(m.free),
          isComingSoon: parseBool(m.is_coming_soon),
          quality: m.quality || null,
          certificate: m.certificate
            ? {
                id: m.certificate.id,
                code: m.certificate.code,
                name: m.certificate.name,
                certification_system: m.certificate.certification_system,
                badge_color: m.certificate.badge_color,
              }
            : null,
          href: `/movies/${m.slug || m.movie_id}`,
          viewCount: m.view_count || 0,
        };
      });
    }

    // -------------------------------------------------------------
    // Query Series from Database
    // -------------------------------------------------------------
    if (shouldSearchSeries) {
      const qb = this.seriesRepo
        .createQueryBuilder('series')
        .leftJoinAndSelect('series.certificate', 'certificate');

      if (isKids) {
        qb.andWhere('series.kids_restriction = 1');
      }

      if (targetGenreId) {
        qb.andWhere(
          '(series.genre_id = :catGenreId OR series.genre_id LIKE :catGenrePatternStart OR series.genre_id LIKE :catGenrePatternMid OR series.genre_id LIKE :catGenrePatternEnd OR series.genre_id LIKE :catNamePattern)',
          {
            catGenreId: targetGenreId,
            catGenrePatternStart: `${targetGenreId},%`,
            catGenrePatternMid: `%,${targetGenreId},%`,
            catGenrePatternEnd: `%,${targetGenreId}`,
            catNamePattern: `%${category}%`,
          },
        );
      }

      if (rawQuery) {
        let genreLikeClause = '';
        const genreLikeParams: Record<string, string> = {};
        if (matchedGenreIds.length > 0) {
          const conditions: string[] = ['series.genre_id IN (:...matchedGenreIds)'];
          matchedGenreIds.forEach((gid, i) => {
            conditions.push(
              `series.genre_id LIKE :sgS${i} OR series.genre_id LIKE :sgM${i} OR series.genre_id LIKE :sgE${i}`,
            );
            genreLikeParams[`sgS${i}`] = `${gid},%`;
            genreLikeParams[`sgM${i}`] = `%,${gid},%`;
            genreLikeParams[`sgE${i}`] = `%,${gid}`;
          });
          genreLikeClause = ` OR (${conditions.join(' OR ')})`;
        }

        const seriesParams: any = { term };
        if (matchedGenreIds.length > 0) {
          seriesParams.matchedGenreIds = matchedGenreIds;
          Object.assign(seriesParams, genreLikeParams);
        }

        qb.andWhere(
          `(series.title LIKE :term OR series.actors LIKE :term OR series.description_short LIKE :term OR series.description_long LIKE :term OR series.genre_id LIKE :term${genreLikeClause})`,
          seriesParams,
        );
      }

      qb.orderBy('series.series_id', 'DESC').take(limit);

      const seriesList = await qb.getMany();

      // Fetch first episode images for series thumbnails if available
      const seriesIds = seriesList.map((s) => s.series_id);
      let episodeImagesMap = new Map<number, string>();
      if (seriesIds.length > 0) {
        const episodes = await this.episodeRepo
          .createQueryBuilder('ep')
          .select(['ep.season_id', 'ep.card_image', 'ep.poster_image', 'ep.image'])
          .where('ep.season_id IN (:...seriesIds)', { seriesIds })
          .getMany();
        episodes.forEach((ep) => {
          if (!episodeImagesMap.has(ep.season_id)) {
            const img = ep.card_image || ep.poster_image || ep.image;
            if (img) episodeImagesMap.set(ep.season_id, img);
          }
        });
      }

      seriesResults = seriesList.map((s) => ({
        id: s.series_id,
        title: s.title || '',
        type: 'series' as const,
        slug: String(s.series_id),
        image: episodeImagesMap.get(s.series_id) || '',
        card_image: episodeImagesMap.get(s.series_id) || '',
        description: s.description_short || s.description_long || '',
        year: s.year || null,
        rating: s.rating ? parseFloat(s.rating.toString()) : null,
        duration: null,
        languages: null,
        director: s.director ? String(s.director) : null,
        actors: s.actors || null,
        genres: resolveGenres(s.genre_id),
        genreIds: s.genre_id !== null && s.genre_id !== undefined ? String(s.genre_id) : null,
        isFree: false,
        isComingSoon: parseBool(s.is_coming_soon),
        quality: s.quality || null,
        certificate: s.certificate
          ? {
              id: s.certificate.id,
              code: s.certificate.code,
              name: s.certificate.name,
              certification_system: s.certificate.certification_system,
              badge_color: s.certificate.badge_color,
            }
          : null,
        href: `/shows`,
        viewCount: 0,
      }));
    }

    // -------------------------------------------------------------
    // Query Interactive Movies from Database
    // -------------------------------------------------------------
    if (shouldSearchInteractive) {
      const qb = this.interactiveRepo
        .createQueryBuilder('im')
        .leftJoinAndSelect('im.certificate', 'certificate');

      if (isKids) {
        qb.andWhere('im.kids_restriction = 1');
      }

      if (targetGenreId) {
        qb.andWhere(
          '(im.genre_id = :catGenreId OR im.genre_id LIKE :catGenrePatternStart OR im.genre_id LIKE :catGenrePatternMid OR im.genre_id LIKE :catGenrePatternEnd OR im.genre_id LIKE :catNamePattern)',
          {
            catGenreId: targetGenreId,
            catGenrePatternStart: `${targetGenreId},%`,
            catGenrePatternMid: `%,${targetGenreId},%`,
            catGenrePatternEnd: `%,${targetGenreId}`,
            catNamePattern: `%${category}%`,
          },
        );
      }

      if (rawQuery) {
        let genreLikeClause = '';
        const genreLikeParams: Record<string, string> = {};
        if (matchedGenreIds.length > 0) {
          const conditions: string[] = ['im.genre_id IN (:...matchedGenreIds)'];
          matchedGenreIds.forEach((gid, i) => {
            conditions.push(
              `im.genre_id LIKE :igS${i} OR im.genre_id LIKE :igM${i} OR im.genre_id LIKE :igE${i}`,
            );
            genreLikeParams[`igS${i}`] = `${gid},%`;
            genreLikeParams[`igM${i}`] = `%,${gid},%`;
            genreLikeParams[`igE${i}`] = `%,${gid}`;
          });
          genreLikeClause = ` OR (${conditions.join(' OR ')})`;
        }

        const interactiveParams: any = { term };
        if (matchedGenreIds.length > 0) {
          interactiveParams.matchedGenreIds = matchedGenreIds;
          Object.assign(interactiveParams, genreLikeParams);
        }

        qb.andWhere(
          `(im.title LIKE :term OR im.description LIKE :term OR im.director LIKE :term OR im.actors LIKE :term OR im.languages LIKE :term OR im.genre_id LIKE :term${genreLikeClause})`,
          interactiveParams,
        );
      }

      qb.orderBy('im.interactive_movie_id', 'DESC').take(limit);

      const interactiveList = await qb.getMany();
      interactiveResults = interactiveList.map((im) => ({
        id: im.interactive_movie_id,
        title: im.title || '',
        type: 'interactive' as const,
        slug: String(im.interactive_movie_id),
        image: im.card_image || im.banner_image || '',
        card_image: im.card_image || im.banner_image || '',
        description: im.description || '',
        year: im.year || null,
        rating: null,
        duration: im.duration || null,
        languages: im.languages || null,
        director: im.director || null,
        actors: im.actors || null,
        genres: resolveGenres(im.genre_id),
        genreIds: im.genre_id !== null && im.genre_id !== undefined ? String(im.genre_id) : null,
        isFree: Number(im.is_free) === 1 || im.price === 0,
        isComingSoon: Boolean(im.is_coming_soon),
        quality: im.quality || null,
        certificate: im.certificate
          ? {
              id: im.certificate.id,
              code: im.certificate.code,
              name: im.certificate.name,
              certification_system: im.certificate.certification_system,
              badge_color: im.certificate.badge_color,
            }
          : null,
        href: `/interactive/${im.interactive_movie_id}`,
        viewCount: 0,
      }));
    }

    // -------------------------------------------------------------
    // Query Shorts (Reels / Short Videos) from Database
    // -------------------------------------------------------------
    if (shouldSearchShorts) {
      const qb = this.shortRepo.createQueryBuilder('short').where('short.is_active = 1');

      if (isKids) {
        qb.andWhere('short.kids_restriction = 1');
      }

      if (targetGenreId) {
        qb.andWhere(
          '(short.genre_id = :catGenreId OR short.genre_id LIKE :catNamePattern)',
          {
            catGenreId: targetGenreId,
            catNamePattern: `%${category}%`,
          },
        );
      }

      if (rawQuery) {
        qb.andWhere(
          '(short.title LIKE :term OR short.slug LIKE :term OR short.description LIKE :term OR short.languages LIKE :term OR short.genre_id LIKE :term)',
          { term },
        );
      }

      qb.orderBy('short.view_count', 'DESC').take(limit);

      const shortsList = await qb.getMany();
      shortResults = shortsList.map((sh) => ({
        id: sh.short_id,
        title: sh.title || '',
        type: 'short' as const,
        slug: sh.slug || String(sh.short_id),
        image: sh.thumbnail_url || '',
        card_image: sh.thumbnail_url || '',
        description: sh.description || '',
        duration: sh.duration || null,
        languages: sh.languages || null,
        genres: resolveGenres(sh.genre_id),
        genreIds: sh.genre_id !== null && sh.genre_id !== undefined ? String(sh.genre_id) : null,
        isFree: Boolean(sh.is_free),
        href: `/shorts?id=${sh.short_id}`,
        viewCount: sh.view_count || 0,
      }));
    }

    // Categorize movies and videos from database
    const pureMovies = movieResults.filter((m) => m.type === 'movie');
    const videoMovies = movieResults.filter((m) => m.type === 'video');
    const allVideos = [...shortResults, ...videoMovies];

    // Combine results based on category filter
    let combinedResults = [
      ...interactiveResults,
      ...movieResults,
      ...seriesResults,
      ...shortResults,
    ];

    if (category === 'movie' || category === 'movies') {
      combinedResults = pureMovies;
    } else if (category === 'video' || category === 'videos') {
      combinedResults = allVideos;
    } else if (category === 'series' || category === 'shows') {
      combinedResults = seriesResults;
    } else if (category === 'interactive') {
      combinedResults = interactiveResults;
    } else if (category === 'shorts' || category === 'short') {
      combinedResults = shortResults;
    }

    const counts = {
      all: combinedResults.length,
      movie: pureMovies.length,
      series: seriesResults.length,
      interactive: interactiveResults.length,
      short: shortResults.length,
      video: allVideos.length,
    };

    return {
      results: combinedResults,
      total: combinedResults.length,
      meta: {
        total: combinedResults.length,
        query: rawQuery,
        category,
        counts,
      },
    };
  }
}
