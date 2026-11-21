import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Episode } from './episode.entity';
import { CreateEpisodeDto, EpisodeResponseDto, UpdateEpisodeDto } from './episode.dto';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

const parseBool = (val: any): boolean => {
  if (val === true || val === false) return val;
  if (val === 1 || val === '1' || val === 'true') return true;
  if (val === 0 || val === '0' || val === 'false') return false;
  return false;
};

import { User } from '../users/entities/user.entity';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private mapRawToEntity(row: any): Episode {
    const e = new Episode();
    e.episode_id = row.episode_id !== undefined ? Number(row.episode_id) : (row.id !== undefined ? Number(row.id) : 0);
    e.season_id = row.season_id !== undefined ? Number(row.season_id) : (row.series_id !== undefined ? Number(row.series_id) : 0);
    e.episode_number = row.episode_number !== undefined ? Number(row.episode_number) : (row.episode_no !== undefined ? Number(row.episode_no) : null as any);
    e.slug = row.slug ? String(row.slug) : String(e.episode_id);
    e.title = row.title ? String(row.title) : '';
    e.description_short = row.description_short ?? row.description ?? '';
    e.description_long = row.description_long ?? '';
    e.duration = row.duration ?? null as any;
    e.quality = row.quality ?? null as any;
    e.url = row.url ?? row.video_url ?? '';
    e.trailer_url = row.trailer_url ?? null as any;
    e.trailer_alt = row.trailer_alt ?? null as any;
    e.image = row.image ?? null as any;
    e.poster_image = row.poster_image ?? null as any;
    e.card_image = row.card_image ?? null as any;
    e.poster_alt = row.poster_alt ?? null as any;
    e.languages = row.languages ?? null as any;
    e.rating = row.rating !== undefined && row.rating !== null ? parseFloat(String(row.rating)) : null as any;
    e.featured = row.featured !== undefined ? parseBool(row.featured) : false;
    e.free = row.free !== undefined ? parseBool(row.free) : false;
    e.is_revenue_managed = row.is_revenue_managed !== undefined ? parseBool(row.is_revenue_managed) : false;
    e.is_svod_eligible = row.is_svod_eligible !== undefined ? parseBool(row.is_svod_eligible) : false;
    e.revenue_share_percent = row.revenue_share_percent !== undefined && row.revenue_share_percent !== null ? parseFloat(String(row.revenue_share_percent)) : null as any;
    e.price = row.price !== undefined && row.price !== null ? parseFloat(String(row.price)) : null as any;
    e.currency = row.currency ?? null as any;
    e.is_coming_soon = row.is_coming_soon !== undefined ? parseBool(row.is_coming_soon) : false;
    e.kids_restriction = row.kids_restriction !== undefined ? parseBool(row.kids_restriction) : false;
    e.view_count = row.view_count !== undefined ? Number(row.view_count) : 0;
    e.certificate_id = row.certificate_id ? Number(row.certificate_id) : null as any;
    e.subtitles = row.subtitles ?? null;
    e.audio_tracks = row.audio_tracks ?? null;
    e.created_at = row.created_at ?? row.createdon ?? null;
    e.updated_at = row.updated_at ?? null;
    return e;
  }

  async create(dto: CreateEpisodeDto): Promise<EpisodeResponseDto> {
    // Auto-generate slug if not provided
    if (!dto.slug && dto.title) {
      dto.slug = dto.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    const episodeData = this.mapFromDto(dto);
    const episode = this.episodeRepository.create(episodeData);
    const saved = await this.episodeRepository.save(episode);
    return this.findOne(saved.episode_id, undefined, true);
  }

  async checkIsAdminUser(
    isAdminQuery: boolean = false,
    authHeader?: string,
    originHeader?: string,
  ): Promise<boolean> {
    if (isAdminQuery) return true;
    if (originHeader && typeof originHeader === 'string' && originHeader.toLowerCase().includes('admin')) {
      return true;
    }
    if (authHeader && typeof authHeader === 'string') {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const user = await this.userRepository.findOne({ where: { user_session: token } });
        if (user && (String(user.type) === '1' || String(user.type) === '2')) {
          return true;
        }
      }
    }
    return false;
  }

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

  async findAll(
    seasonId?: number,
    userId?: number,
    isAdminQuery: boolean = false,
    authHeader?: string,
    originHeader?: string,
    limit?: number,
    kidsQueryFlag?: boolean | string,
    kidsHeaderFlag?: boolean | string,
  ): Promise<EpisodeResponseDto[]> {
    const isAdmin = await this.checkIsAdminUser(isAdminQuery, authHeader, originHeader);
    const options: any = {
      where: seasonId ? { season_id: seasonId } : {},
      relations: ['certificate'],
      order: { season_id: 'ASC', episode_number: 'ASC' },
    };
    if (limit) options.take = limit;

    let episodes: Episode[] = [];
    try {
      episodes = await this.episodeRepository.find(options);
    } catch (err: any) {
      console.warn('Episode find with relations failed, retrying without relations:', err?.message);
      try {
        const fallbackOptions = { ...options };
        delete fallbackOptions.relations;
        episodes = await this.episodeRepository.find(fallbackOptions);
      } catch (err2: any) {
        console.warn('Episode find without relations failed, falling back to raw SQL query:', err2?.message);
        try {
          const sqlWhere = seasonId ? 'WHERE season_id = ?' : '';
          const sqlLimit = limit ? `LIMIT ${limit}` : '';
          const rawRows = await this.episodeRepository.query(
            `SELECT * FROM \`episode\` ${sqlWhere} ORDER BY episode_id ASC ${sqlLimit}`,
            seasonId ? [seasonId] : [],
          );
          episodes = rawRows.map((r: any) => this.mapRawToEntity(r));
        } catch (err3: any) {
          console.error('Episode raw query also failed:', err3);
          throw err2;
        }
      }
    }

    const isKidsMode = await this.isKidsModeActive(userId, authHeader, kidsQueryFlag, kidsHeaderFlag);
    if (isKidsMode) {
      episodes = episodes.filter(e => parseBool(e.kids_restriction));
    }
    const hasSubAccess = userId ? await this.checkStandardAccess(userId) : false;
    return episodes.map(e => {
      const isFree = parseBool(e.free);
      const hasAccess = isAdmin || isFree || hasSubAccess;
      const res = this.mapToResponse(e);
      if (!hasAccess) {
        if (res.media && res.media.video) {
          res.media.video.url = "";
        }
      }
      return res;
    });
  }

  async checkStandardAccess(userId?: number): Promise<boolean> {
    if (!userId) return false;
    const user = await this.userRepository.findOne({ where: { userId: userId } });
    if (!user) return false;

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const activeSub = await this.subscriptionRepository.findOne({
      where: { userId, status: 1 },
      relations: ['plan'],
      order: { subscriptionId: 'DESC' },
    });

    if (activeSub) {
      const fromSec = Number(activeSub.timestamp_from) || 0;
      const toSec = Number(activeSub.timestamp_to) || 0;

      if (toSec > 0 && toSec < currentTimestamp) {
        activeSub.status = 0;
        await this.subscriptionRepository.save(activeSub);
      } else if (activeSub.plan) {
        const isPaid = Number(activeSub.payment_status) === 2 || String(activeSub.payment_method).toUpperCase() === 'FREE';
        const isValidDate = (fromSec === 0 || fromSec <= currentTimestamp) && (toSec === 0 || toSec >= currentTimestamp);

        if (isPaid && isValidDate) {
          let expectedStandard = 0;
          let expectedInteractive = 0;

          const p = activeSub.plan as any;
          const planName = (p.name || '').toLowerCase();
          const pFeatures = (p.features || '').toLowerCase();
          const pDesc = (p.description || '').toLowerCase();
          const combined = `${planName} ${pFeatures} ${pDesc}`;

          if (combined.includes('interactive') || combined.includes('branching') || p.plan_id === 2 || p.planId === 2) {
            expectedInteractive = 1;
            expectedStandard = 1;
          } else {
            expectedStandard = 1;
          }

          return expectedStandard === 1;
        }
      }
    }

    if (Number(user.standard_access) !== 0 || Number(user.interactive_access) !== 0) {
      user.standard_access = 0;
      user.interactive_access = 0;
      await this.userRepository.save(user);
    }

    return false;
  }

  async findOne(
    idOrSlug: string | number,
    userId?: number,
    isAdminQuery: boolean = false,
    authHeader?: string,
    originHeader?: string,
    kidsQueryFlag?: boolean | string,
    kidsHeaderFlag?: boolean | string,
  ): Promise<EpisodeResponseDto> {
    const isAdmin = await this.checkIsAdminUser(isAdminQuery, authHeader, originHeader);
    let episode: Episode | null = null;
    const isNum = typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug));

    try {
      if (isNum) {
        episode = await this.episodeRepository.findOne({
          where: { episode_id: Number(idOrSlug) },
          relations: ['certificate'],
        });
      } else {
        episode = await this.episodeRepository.findOne({
          where: { slug: String(idOrSlug) },
          relations: ['certificate'],
        });
      }
    } catch (err: any) {
      console.warn('Episode findOne with relations failed, retrying without relations:', err?.message);
      try {
        if (isNum) {
          episode = await this.episodeRepository.findOne({ where: { episode_id: Number(idOrSlug) } });
        } else {
          episode = await this.episodeRepository.findOne({ where: { slug: String(idOrSlug) } });
        }
      } catch (err2: any) {
        console.warn('Episode findOne fallback to raw query:', err2?.message);
        try {
          const rows = await this.episodeRepository.query(
            isNum
              ? 'SELECT * FROM `episode` WHERE episode_id = ? LIMIT 1'
              : 'SELECT * FROM `episode` WHERE slug = ? OR episode_id = ? LIMIT 1',
            isNum ? [Number(idOrSlug)] : [String(idOrSlug), Number(idOrSlug) || 0],
          );
          if (rows && rows.length > 0) {
            episode = this.mapRawToEntity(rows[0]);
          }
        } catch (err3: any) {
          console.error('Episode findOne raw query failed:', err3);
          throw err2;
        }
      }
    }

    if (!episode) throw new NotFoundException('Episode not found');
    const isKidsMode = await this.isKidsModeActive(userId, authHeader, kidsQueryFlag, kidsHeaderFlag);
    if (isKidsMode && !parseBool(episode.kids_restriction)) {
      throw new NotFoundException('Episode not found');
    }

    const isFree = parseBool(episode.free);
    const hasSubAccess = userId ? await this.checkStandardAccess(userId) : false;
    const hasAccess = isAdmin || isFree || hasSubAccess;

    const response = this.mapToResponse(episode);
    if (!hasAccess) {
      if (response.media && response.media.video) {
        response.media.video.url = "";
      }
    }
    return response;
  }

  async update(id: number, dto: UpdateEpisodeDto): Promise<EpisodeResponseDto> {
    const existing = await this.episodeRepository.findOneBy({ episode_id: id });
    if (!existing) throw new NotFoundException('Episode not found');
    const updateData = this.mapFromDto(dto);
    delete (updateData as any).id;
    delete (updateData as any).episode_id;
    delete (updateData as any).createdAt;
    delete (updateData as any).updatedAt;
    delete (updateData as any).created_at;
    delete (updateData as any).updated_at;

    await this.episodeRepository.update({ episode_id: id }, updateData);
    return this.findOne(id, undefined, true);
  }

  async remove(id: number): Promise<void> {
    const episode = await this.episodeRepository.findOneBy({ episode_id: id });
    if (!episode) throw new NotFoundException('Episode not found');
    await this.episodeRepository.delete(id);
  }

  async incrementView(id: number): Promise<void> {
    await this.episodeRepository.increment({ episode_id: id }, 'view_count', 1);
  }

  private mapFromDto(dto: CreateEpisodeDto | UpdateEpisodeDto): Partial<Episode> {
    const { media, free, isFree, is_free, featured, isFeatured, is_featured, is_revenue_managed, isRevenueManaged, is_revenue_shared, isRevenueShared, ...rest } = dto as any;
    const episode: Partial<Episode> = { ...rest };

    const rawSeasonId = (dto as any).season_id ?? (dto as any).series_id ?? (dto as any).seriesId ?? (dto as any).seasonId;
    if (rawSeasonId !== undefined && rawSeasonId !== null && rawSeasonId !== '') {
      episode.season_id = Number(rawSeasonId);
    }

    const rawEpNum = (dto as any).episode_number ?? (dto as any).episode_no ?? (dto as any).episodeNumber ?? (dto as any).ep_number;
    if (rawEpNum !== undefined && rawEpNum !== null && rawEpNum !== '') {
      episode.episode_number = Number(rawEpNum);
    }

    const rawUrl = (dto as any).url ?? (dto as any).video_url ?? (dto as any).videoUrl;
    if (rawUrl !== undefined && rawUrl !== null && typeof rawUrl === 'string') {
      episode.url = rawUrl;
    }

    const revenueManagedInput = is_revenue_managed !== undefined ? is_revenue_managed : (isRevenueManaged !== undefined ? isRevenueManaged : (is_revenue_shared !== undefined ? is_revenue_shared : isRevenueShared));
    if (revenueManagedInput !== undefined) {
      episode.is_revenue_managed = parseBool(revenueManagedInput);
    }

    const kidsInput = (rest as any).kids_restriction !== undefined ? (rest as any).kids_restriction : (rest as any).kidsRestriction;
    if (kidsInput !== undefined) {
      episode.kids_restriction = parseBool(kidsInput);
    }

    const freeInput = free !== undefined ? free : (isFree !== undefined ? isFree : is_free);
    if (freeInput !== undefined) {
      episode.free = parseBool(freeInput);
    }

    const featuredInput = featured !== undefined ? featured : (isFeatured !== undefined ? isFeatured : is_featured);
    if (featuredInput !== undefined) {
      episode.featured = parseBool(featuredInput);
    }

    const certInput = (rest as any).certificate_id !== undefined ? (rest as any).certificate_id : (rest as any).certificateId;
    if (certInput !== undefined) {
      if (certInput === '' || certInput === null || certInput === 'none' || certInput === 0) {
        episode.certificate_id = null as any;
      } else {
        const parsed = parseInt(String(certInput), 10);
        episode.certificate_id = isNaN(parsed) ? (null as any) : parsed;
      }
    }

    if (media) {
      if (media.image) {
        episode.image = media.image.url;
        episode.poster_alt = media.image.alt;
      }
      if (media.card_image) {
        episode.card_image = media.card_image.url;
      }
      if (media.video) {
        episode.url = media.video.url;
      }
      if (media.trailer) {
        episode.trailer_url = media.trailer.url;
        episode.trailer_alt = media.trailer.alt;
      }
    }

    return episode;
  }

  public mapToResponse(e: Episode): EpisodeResponseDto {
    const isFreeBool = parseBool(e.free);
    const isFeaturedBool = parseBool(e.featured);

    return {
      id: e.episode_id,
      season_id: e.season_id,
      episode_number: e.episode_number,
      title: e.title || '',
      slug: e.slug || String(e.episode_id),
      shortDescription: e.description_short || '',
      longDescription: e.description_long || '',
      duration: e.duration || null as any,
      quality: e.quality || null as any,
      play_quality: e.quality || null as any,
      video_quality: e.quality || null as any,
      languages: e.languages || null as any,
      rating: e.rating !== null && e.rating !== undefined ? parseFloat(e.rating.toString()) : null as any,
      isFeatured: isFeaturedBool,
      isFree: isFreeBool,
      isComingSoon: Boolean(e.is_coming_soon),
      is_coming_soon: Boolean(e.is_coming_soon),
      kids_restriction: parseBool(e.kids_restriction),
      kidsRestriction: parseBool(e.kids_restriction),
      is_revenue_managed: parseBool(e.is_revenue_managed),
      is_svod_eligible: parseBool(e.is_svod_eligible),
      revenue_share_percent: e.revenue_share_percent !== null && e.revenue_share_percent !== undefined ? parseFloat(e.revenue_share_percent.toString()) : null as any,
      price: e.price !== null && e.price !== undefined ? parseFloat(e.price.toString()) : null as any,
      currency: e.currency || null as any,
      viewCount: e.view_count || 0,
      subtitles: e.subtitles || null,
      audio_tracks: e.audio_tracks || null,
      certificate_id: e.certificate_id || (e.certificate ? e.certificate.id : null),
      certificateId: e.certificate_id || (e.certificate ? e.certificate.id : null),
      certificate: e.certificate ? {
        id: e.certificate.id,
        code: e.certificate.code,
        name: e.certificate.name,
        certification_system: e.certificate.certification_system,
        maturity_level: e.certificate.maturity_level,
        badge_color: e.certificate.badge_color,
      } : null,
      media: {
        image: { url: e.image || '', alt: e.poster_alt || '' },
        poster_image: { url: e.poster_image || '', alt: '' },
        card_image: { url: e.card_image || '', alt: '' },
        video: { url: e.url || '', alt: '' },
        trailer: { url: e.trailer_url || '', alt: e.trailer_alt || '' },
      },
      createdAt: e.created_at || null as any,
      updatedAt: e.updated_at || null as any,
    };
  }
}
