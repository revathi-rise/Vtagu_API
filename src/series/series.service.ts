import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Series } from './entities/series.entity';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/series.dto';
import { User } from '../users/entities/user.entity';
import { Episode } from '../episodes/episode.entity';

const parseBool = (val: any): boolean => {
  if (val === true || val === false) return val;
  if (val === 1 || val === '1' || val === 'true') return true;
  if (val === 0 || val === '0' || val === 'false') return false;
  return false;
};

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private repository: Repository<Series>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
  ) {}

  async isKidsModeActive(
    userId?: number,
    authHeader?: string,
    kidsQueryFlag?: boolean | string,
    kidsHeaderFlag?: boolean | string,
  ): Promise<boolean> {
    if (authHeader && typeof authHeader === 'string') {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const user = await this.userRepository.findOne({ where: { user_session: token } });
        if (user && parseBool(user.is_kids_mode)) return true;
      }
    }
    if (userId) {
      const user = await this.userRepository.findOne({ where: { userId } });
      if (user && parseBool(user.is_kids_mode)) return true;
    }
    if (kidsQueryFlag !== undefined && parseBool(kidsQueryFlag)) return true;
    if (kidsHeaderFlag !== undefined && parseBool(kidsHeaderFlag)) return true;
    return false;
  }

  private formatEpisode(e: any): any {
    const isFreeBool = parseBool(e.free);
    const isFeaturedBool = parseBool(e.featured);
    const epId = e.episode_id !== undefined ? Number(e.episode_id) : (e.id !== undefined ? Number(e.id) : 0);
    const sId = e.season_id !== undefined ? Number(e.season_id) : (e.series_id !== undefined ? Number(e.series_id) : 0);
    const epNum = e.episode_number !== undefined && e.episode_number !== null ? Number(e.episode_number) : 1;
    const url = e.url || e.video_url || '';
    const image = e.image || '';
    const posterImage = e.poster_image || '';
    const cardImage = e.card_image || '';
    const trailerUrl = e.trailer_url || '';
    const trailerAlt = e.trailer_alt || '';
    const posterAlt = e.poster_alt || '';

    return {
      id: epId,
      episode_id: epId,
      season_id: sId,
      series_id: sId,
      episode_number: epNum,
      title: e.title || '',
      slug: e.slug || String(epId),
      description_short: e.description_short || '',
      description_long: e.description_long || '',
      shortDescription: e.description_short || '',
      longDescription: e.description_long || '',
      duration: e.duration || null,
      quality: e.quality || 'HD',
      play_quality: e.quality || 'HD',
      video_quality: e.quality || 'HD',
      languages: e.languages || null,
      rating: e.rating !== null && e.rating !== undefined ? parseFloat(String(e.rating)) : null,
      isFeatured: isFeaturedBool,
      isFree: isFreeBool,
      free: isFreeBool,
      featured: isFeaturedBool,
      isComingSoon: Boolean(e.is_coming_soon),
      is_coming_soon: Boolean(e.is_coming_soon),
      is_revenue_managed: parseBool(e.is_revenue_managed),
      is_svod_eligible: parseBool(e.is_svod_eligible),
      revenue_share_percent: e.revenue_share_percent !== null && e.revenue_share_percent !== undefined ? parseFloat(String(e.revenue_share_percent)) : null,
      price: e.price !== null && e.price !== undefined ? parseFloat(String(e.price)) : null,
      currency: e.currency || null,
      view_count: e.view_count !== undefined ? Number(e.view_count) : 0,
      viewCount: e.view_count !== undefined ? Number(e.view_count) : 0,
      subtitles: e.subtitles || null,
      audio_tracks: e.audio_tracks || null,
      certificate_id: e.certificate_id ? Number(e.certificate_id) : null,
      certificateId: e.certificate_id ? Number(e.certificate_id) : null,
      url,
      image,
      poster_image: posterImage,
      card_image: cardImage,
      trailer_url: trailerUrl,
      trailer_alt: trailerAlt,
      poster_alt: posterAlt,
      media: {
        image: { url: image, alt: posterAlt },
        poster_image: { url: posterImage, alt: '' },
        card_image: { url: cardImage, alt: '' },
        video: { url, alt: '' },
        trailer: { url: trailerUrl, alt: trailerAlt },
      },
      createdAt: e.created_at || null,
      updatedAt: e.updated_at || null,
    };
  }

  private buildSeasonHierarchy(episodes: any[]): any[] {
    if (!episodes || episodes.length === 0) return [];

    const seasonMap = new Map<number, any[]>();
    for (const ep of episodes) {
      const seasonNum = (ep as any).season_number || (ep as any).season_no || 1;
      if (!seasonMap.has(seasonNum)) {
        seasonMap.set(seasonNum, []);
      }
      seasonMap.get(seasonNum)!.push(ep);
    }

    return Array.from(seasonMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([seasonNum, epList]) => ({
        season_number: seasonNum,
        name: `Season ${seasonNum}`,
        total_episodes: epList.length,
        episodes: epList.sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0)),
      }));
  }

  private async fetchEpisodesForSeries(seriesId: number): Promise<Episode[]> {
    try {
      return await this.episodeRepository.find({
        where: { season_id: seriesId },
        order: { episode_number: 'ASC', episode_id: 'ASC' },
      });
    } catch (err: any) {
      try {
        return await this.episodeRepository.query(
          'SELECT * FROM `episode` WHERE season_id = ? ORDER BY episode_number ASC, episode_id ASC',
          [seriesId],
        );
      } catch (err2) {
        return [];
      }
    }
  }

  private async fetchEpisodesForSeriesList(seriesIds: number[]): Promise<Episode[]> {
    if (!seriesIds.length) return [];
    try {
      return await this.episodeRepository.find({
        where: { season_id: In(seriesIds) },
        order: { episode_number: 'ASC', episode_id: 'ASC' },
      });
    } catch (err: any) {
      try {
        const placeholders = seriesIds.map(() => '?').join(',');
        return await this.episodeRepository.query(
          `SELECT * FROM \`episode\` WHERE season_id IN (${placeholders}) ORDER BY episode_number ASC, episode_id ASC`,
          seriesIds,
        );
      } catch (err2) {
        return [];
      }
    }
  }

  async findAll(
    limit?: number,
    userId?: number,
    authHeader?: string,
    kidsQueryFlag?: boolean | string,
    kidsHeaderFlag?: boolean | string,
  ): Promise<any[]> {
    let seriesList = await this.repository.find({
      ...(limit ? { take: limit } : {}),
      relations: ['certificate'],
      order: { series_id: 'ASC' },
    });
    const isKidsMode = await this.isKidsModeActive(userId, authHeader, kidsQueryFlag, kidsHeaderFlag);
    if (isKidsMode) {
      seriesList = seriesList.filter(s => parseBool(s.kids_restriction));
    }

    if (seriesList.length === 0) return [];

    const seriesIds = seriesList.map(s => s.series_id);
    const allEpisodes = await this.fetchEpisodesForSeriesList(seriesIds);

    const episodesBySeries = new Map<number, any[]>();
    for (const ep of allEpisodes) {
      const sId = Number(ep.season_id);
      if (!episodesBySeries.has(sId)) {
        episodesBySeries.set(sId, []);
      }
      episodesBySeries.get(sId)!.push(this.formatEpisode(ep));
    }

    return seriesList.map(s => {
      const eps = episodesBySeries.get(s.series_id) || [];
      const seasons = this.buildSeasonHierarchy(eps);
      return {
        ...s,
        total_episodes: eps.length,
        episodes_count: eps.length,
        seasons,
        episodes: eps,
      };
    });
  }

  async findOne(
    id: number,
    userId?: number,
    authHeader?: string,
    kidsQueryFlag?: boolean | string,
    kidsHeaderFlag?: boolean | string,
  ): Promise<any> {
    const series = await this.repository.findOne({ where: { series_id: id }, relations: ['certificate'] });
    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }
    const isKidsMode = await this.isKidsModeActive(userId, authHeader, kidsQueryFlag, kidsHeaderFlag);
    if (isKidsMode && !parseBool(series.kids_restriction)) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }

    const rawEpisodes = await this.fetchEpisodesForSeries(id);
    const episodes = rawEpisodes.map(ep => this.formatEpisode(ep));
    const seasons = this.buildSeasonHierarchy(episodes);

    return {
      ...series,
      total_episodes: episodes.length,
      episodes_count: episodes.length,
      seasons,
      episodes,
    };
  }

  async findEpisodes(seriesId: number): Promise<any[]> {
    const rawEpisodes = await this.fetchEpisodesForSeries(seriesId);
    return rawEpisodes.map(ep => this.formatEpisode(ep));
  }

  async create(dto: CreateSeriesDto): Promise<any> {
    const data: any = { ...dto };
    if (data.kids_restriction !== undefined) data.kids_restriction = parseBool(data.kids_restriction);
    if (data.free !== undefined) {
      data.free = parseBool(data.free) ? 'Y' : (data.free === 'Y' || data.free === 'N' ? data.free : 'N');
    }
    if (data.is_coming_soon !== undefined) data.is_coming_soon = parseBool(data.is_coming_soon);
    if (data.certificate_id !== undefined || data.certificateId !== undefined) {
      const cId = data.certificate_id ?? data.certificateId;
      data.certificate_id = cId ? Number(cId) : null;
      delete data.certificateId;
    }
    const series = this.repository.create(data as Partial<Series>);
    const saved: any = await this.repository.save(series as any);
    return this.findOne(saved.series_id);
  }

  async update(id: number, dto: UpdateSeriesDto): Promise<any> {
    const series = await this.repository.findOne({ where: { series_id: id } });
    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }
    const data: any = { ...dto };
    if (data.kids_restriction !== undefined) data.kids_restriction = parseBool(data.kids_restriction);
    if (data.free !== undefined) {
      data.free = parseBool(data.free) ? 'Y' : (data.free === 'Y' || data.free === 'N' ? data.free : 'N');
    }
    if (data.is_coming_soon !== undefined) data.is_coming_soon = parseBool(data.is_coming_soon);
    if (data.certificate_id !== undefined || data.certificateId !== undefined) {
      const cId = data.certificate_id ?? data.certificateId;
      data.certificate_id = cId ? Number(cId) : null;
      delete data.certificateId;
    }
    Object.assign(series, data);
    await this.repository.save(series);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const series = await this.repository.findOne({ where: { series_id: id } });
    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }
    await this.repository.remove(series);
  }
}
