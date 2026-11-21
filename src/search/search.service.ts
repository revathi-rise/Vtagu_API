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

    // 1. Fetch all genres for name mapping and dynamic filter pills
    const allGenres = await this.genreRepo.find({ order: { genre_id: 'ASC' } });
    const genreMap = new Map<string, string>();
    allGenres.forEach((g) => {
      genreMap.set(String(g.genre_id), g.name);
      genreMap.set(g.name.toLowerCase(), g.name);
    });

    const categoriesList = [
      'All',
      'Action',
      'Sci-Fi',
      'Interactive',
      'Shorts',
      'Drama',
      'Comedy',
      ...allGenres
        .map((g) => g.name)
        .filter(
          (name) =>
            !['Action', 'Sci-Fi', 'Interactive', 'Shorts', 'Drama', 'Comedy', 'All'].includes(name),
        ),
    ];

    // Helper to extract genres list from comma-separated string
    const resolveGenres = (rawGenreIds?: string | null): string[] => {
      if (!rawGenreIds) return [];
      const parts = rawGenreIds.split(',').map((p) => p.trim()).filter(Boolean);
      return parts.map((p) => genreMap.get(p) || genreMap.get(p.toLowerCase()) || p);
    };

    // 2. Perform multi-entity search if query is provided
    let movieResults: SearchResultItem[] = [];
    let seriesResults: SearchResultItem[] = [];
    let interactiveResults: SearchResultItem[] = [];
    let shortResults: SearchResultItem[] = [];

    // Check if category matches specific content types or genre filter
    const isGenreCategory =
      category !== 'all' &&
      category !== 'movie' &&
      category !== 'movies' &&
      category !== 'series' &&
      category !== 'interactive' &&
      category !== 'shorts' &&
      category !== 'short';

    const shouldSearchMovies =
      category === 'all' || category === 'movie' || category === 'movies' || isGenreCategory;
    const shouldSearchSeries =
      category === 'all' || category === 'series' || isGenreCategory;
    const shouldSearchInteractive =
      category === 'all' || category === 'interactive' || isGenreCategory;
    const shouldSearchShorts =
      category === 'all' || category === 'shorts' || category === 'short' || isGenreCategory;

    // Search term and matching genre ID detection
    const term = `%${rawQuery}%`;
    const matchedGenreIds: string[] = [];
    if (rawQuery) {
      allGenres.forEach((g) => {
        if (g.name.toLowerCase().includes(rawQuery.toLowerCase())) {
          matchedGenreIds.push(String(g.genre_id));
        }
      });
    }

    // Category genre matching or explicit genre parameter
    let targetGenreId: string | null = null;
    const rawGenre = (queryDto.genre || '').trim().toLowerCase();
    if (rawGenre) {
      const g = allGenres.find(
        (item) => item.name.toLowerCase() === rawGenre || String(item.genre_id) === rawGenre,
      );
      if (g) targetGenreId = String(g.genre_id);
    } else if (isGenreCategory) {
      const g = allGenres.find((item) => item.name.toLowerCase() === category);
      if (g) targetGenreId = String(g.genre_id);
    }

    // -------------------------------------------------------------
    // Query Movies
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

        qb.andWhere(
          `(movie.title LIKE :term OR movie.actors LIKE :term OR movie.director LIKE :term OR movie.description_short LIKE :term OR movie.description_long LIKE :term OR movie.languages LIKE :term OR movie.genre_id LIKE :term${genreLikeClause})`,
          { term, matchedGenreIds, ...genreLikeParams },
        );
      }

      qb.orderBy('movie.view_count', 'DESC').addOrderBy('movie.movie_id', 'DESC').take(limit);

      const movies = await qb.getMany();
      movieResults = movies.map((m) => ({
        id: m.movie_id,
        title: m.title || 'Untitled Movie',
        type: 'movie',
        slug: m.slug || String(m.movie_id),
        image: m.card_image || m.movie_image || '',
        card_image: m.card_image || m.movie_image || '',
        description: m.description_short || m.description_long || '',
        year: m.year,
        rating: m.rating ? parseFloat(m.rating.toString()) : null,
        duration: m.duration || null,
        languages: m.languages || null,
        director: m.director || null,
        actors: m.actors || null,
        genres: resolveGenres(m.genre_id),
        genreIds: m.genre_id,
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
      }));
    }

    // -------------------------------------------------------------
    // Query Series
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

        qb.andWhere(
          `(series.title LIKE :term OR series.actors LIKE :term OR series.description_short LIKE :term OR series.description_long LIKE :term OR series.genre_id LIKE :term${genreLikeClause})`,
          { term, matchedGenreIds, ...genreLikeParams },
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
        title: s.title || 'Untitled Series',
        type: 'series',
        slug: String(s.series_id),
        image: episodeImagesMap.get(s.series_id) || '',
        card_image: episodeImagesMap.get(s.series_id) || '',
        description: s.description_short || s.description_long || '',
        year: s.year,
        rating: s.rating ? parseFloat(s.rating.toString()) : null,
        duration: 'Series',
        languages: null,
        director: s.director ? String(s.director) : null,
        actors: s.actors || null,
        genres: resolveGenres(s.genre_id),
        genreIds: s.genre_id,
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
    // Query Interactive Movies
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

        qb.andWhere(
          `(im.title LIKE :term OR im.description LIKE :term OR im.director LIKE :term OR im.actors LIKE :term OR im.languages LIKE :term OR im.genre_id LIKE :term${genreLikeClause})`,
          { term, matchedGenreIds, ...genreLikeParams },
        );
      }

      qb.orderBy('im.interactive_movie_id', 'DESC').take(limit);

      const interactiveList = await qb.getMany();
      interactiveResults = interactiveList.map((im) => ({
        id: im.interactive_movie_id,
        title: im.title || 'Untitled Interactive',
        type: 'interactive',
        slug: String(im.interactive_movie_id),
        image: im.card_image || im.banner_image || '',
        card_image: im.card_image || im.banner_image || '',
        description: im.description || '',
        year: im.year || 2026,
        rating: 9.2,
        duration: im.duration || 'Interactive Story',
        languages: im.languages || null,
        director: im.director || null,
        actors: im.actors || null,
        genres: resolveGenres(im.genre_id),
        genreIds: im.genre_id,
        isFree: Number(im.is_free) === 1 || im.price === 0,
        isComingSoon: Boolean(im.is_coming_soon),
        quality: im.quality || '4K ULTRA HD',
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
        viewCount: 100,
      }));
    }

    // -------------------------------------------------------------
    // Query Shorts
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
          '(short.title LIKE :term OR short.description LIKE :term OR short.languages LIKE :term)',
          { term },
        );
      }

      qb.orderBy('short.view_count', 'DESC').take(limit);

      const shortsList = await qb.getMany();
      shortResults = shortsList.map((sh) => ({
        id: sh.short_id,
        title: sh.title || 'Short Reel',
        type: 'short',
        slug: sh.slug || String(sh.short_id),
        image: sh.thumbnail_url || '',
        card_image: sh.thumbnail_url || '',
        description: sh.description || '',
        duration: sh.duration || 'Short',
        languages: sh.languages || null,
        isFree: Boolean(sh.is_free),
        href: `/shorts?id=${sh.short_id}`,
        viewCount: sh.view_count || 0,
      }));
    }

    // Combine and sort results
    let combinedResults = [
      ...interactiveResults,
      ...movieResults,
      ...seriesResults,
      ...shortResults,
    ];

    // Filter by category if strictly specified (and not already filtered)
    if (category === 'movie' || category === 'movies') {
      combinedResults = movieResults;
    } else if (category === 'series') {
      combinedResults = seriesResults;
    } else if (category === 'interactive') {
      combinedResults = interactiveResults;
    } else if (category === 'shorts' || category === 'short') {
      combinedResults = shortResults;
    }

    // 3. Recommended items for initial search landing or empty query
    const recommendedQb = this.movieRepo
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.certificate', 'certificate');

    if (isKids) {
      recommendedQb.andWhere('(movie.kids_restriction = 1 OR movie.kids_only = 1)');
    } else {
      recommendedQb.andWhere('(movie.kids_only IS NULL OR movie.kids_only = 0)');
    }

    recommendedQb
      .orderBy('movie.featured', 'DESC')
      .addOrderBy('movie.view_count', 'DESC')
      .take(8);

    const recommendedMovies = await recommendedQb.getMany();
    const recommendedItems: SearchResultItem[] = recommendedMovies.map((m) => ({
      id: m.movie_id,
      title: m.title || 'Featured Movie',
      type: 'movie',
      slug: m.slug || String(m.movie_id),
      image: m.card_image || m.movie_image || '',
      card_image: m.card_image || m.movie_image || '',
      description: m.description_short || '',
      year: m.year,
      rating: m.rating ? parseFloat(m.rating.toString()) : null,
      duration: m.duration || null,
      languages: m.languages || null,
      genres: resolveGenres(m.genre_id),
      isFree: parseBool(m.free),
      isComingSoon: parseBool(m.is_coming_soon),
      quality: m.quality || null,
      certificate: m.certificate
        ? {
            id: m.certificate.id,
            code: m.certificate.code,
            name: m.certificate.name,
            badge_color: m.certificate.badge_color,
          }
        : null,
      href: `/movies/${m.slug || m.movie_id}`,
    }));

    // Add interactive original to recommendations if exists
    const topInteractive = await this.interactiveRepo.find({ take: 1, order: { interactive_movie_id: 'DESC' } });
    if (topInteractive.length > 0) {
      const im = topInteractive[0];
      recommendedItems.unshift({
        id: im.interactive_movie_id,
        title: im.title,
        type: 'interactive',
        slug: String(im.interactive_movie_id),
        image: im.card_image || im.banner_image || '',
        card_image: im.card_image || im.banner_image || '',
        description: im.description || '',
        year: im.year || 2026,
        rating: 9.5,
        duration: im.duration || 'Interactive Story',
        genres: ['Interactive Original'],
        isFree: Number(im.is_free) === 1,
        quality: im.quality || '4K ULTRA HD',
        href: `/interactive/${im.interactive_movie_id}`,
      });
    }

    // 4. Trending Searches dynamic tags
    const trendingSearches: string[] = [];
    if (topInteractive.length > 0 && topInteractive[0].title) {
      trendingSearches.push(topInteractive[0].title);
    }
    recommendedMovies.slice(0, 3).forEach((m) => {
      if (m.title && !trendingSearches.includes(m.title)) {
        trendingSearches.push(m.title);
      }
    });
    ['Action Thriller', 'Interactive Originals', 'Shorts Series', 'Sci-Fi Action', 'Tamil Cinema'].forEach(
      (term) => {
        if (!trendingSearches.includes(term) && trendingSearches.length < 8) {
          trendingSearches.push(term);
        }
      },
    );

    return {
      results: rawQuery || isGenreCategory || (category !== 'all') ? combinedResults : [],
      meta: {
        total: combinedResults.length,
        query: rawQuery,
        category,
        counts: {
          all: combinedResults.length,
          movie: movieResults.length,
          series: seriesResults.length,
          interactive: interactiveResults.length,
          short: shortResults.length,
        },
      },
      trendingSearches,
      recommended: recommendedItems,
      categories: categoriesList,
    };
  }
}
