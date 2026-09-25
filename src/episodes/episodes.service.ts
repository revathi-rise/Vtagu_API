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
    return this.mapToResponse(saved);
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

  async findAll(
    seasonId?: number,
    userId?: number,
    isAdminQuery: boolean = false,
    authHeader?: string,
    originHeader?: string,
  ): Promise<EpisodeResponseDto[]> {
    const isAdmin = await this.checkIsAdminUser(isAdminQuery, authHeader, originHeader);
    const where = seasonId ? { season_id: seasonId } : {};
    const episodes = await this.episodeRepository.find({
      where,
      order: { season_id: 'ASC', episode_number: 'ASC' },
    });
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

    if (activeSub && activeSub.plan) {
      const fromSec = Number(activeSub.timestamp_from) || 0;
      const toSec = Number(activeSub.timestamp_to) || 0;
      const isPaid = Number(activeSub.payment_status) === 2 || Number(activeSub.payment_status) === 1 || String(activeSub.payment_method).toUpperCase() === 'FREE';
      const isValidDate = (fromSec === 0 || fromSec <= currentTimestamp) && (toSec === 0 || toSec >= currentTimestamp);

      if (isPaid && isValidDate) {
        let expectedStandard = 0;
        let expectedInteractive = 0;
        if (Number(activeSub.plan.unlimited) === 1) {
          expectedStandard = 1;
          expectedInteractive = 1;
        } else {
          expectedStandard = Number(activeSub.plan.isStandardAccess) === 1 ? 1 : 0;
          expectedInteractive = Number(activeSub.plan.isInteractiveIncluded) === 1 ? 1 : 0;
        }

        if (Number(user.standard_access) !== expectedStandard || Number(user.interactive_access) !== expectedInteractive) {
          user.standard_access = expectedStandard;
          user.interactive_access = expectedInteractive;
          await this.userRepository.save(user);
        }

        return expectedStandard === 1;
      }
    } else {
      if (Number(user.standard_access) !== 0 || Number(user.interactive_access) !== 0) {
        user.standard_access = 0;
        user.interactive_access = 0;
        await this.userRepository.save(user);
      }
    }

    return user.standard_access === 1;
  }

  async findOne(
    idOrSlug: string | number,
    userId?: number,
    isAdminQuery: boolean = false,
    authHeader?: string,
    originHeader?: string,
  ): Promise<EpisodeResponseDto> {
    const isAdmin = await this.checkIsAdminUser(isAdminQuery, authHeader, originHeader);
    let episode: Episode;
    if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
      episode = await this.episodeRepository.findOneBy({ episode_id: Number(idOrSlug) });
    } else {
      episode = await this.episodeRepository.findOneBy({ slug: String(idOrSlug) });
    }
    if (!episode) throw new NotFoundException('Episode not found');

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
    const updated = await this.episodeRepository.findOneBy({ episode_id: id });
    return this.mapToResponse(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.episodeRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Episode not found');
  }

  async incrementView(id: number): Promise<void> {
    await this.episodeRepository.increment({ episode_id: id }, 'view_count', 1);
  }

  private mapFromDto(dto: CreateEpisodeDto | UpdateEpisodeDto): Partial<Episode> {
    const { media, free, isFree, is_free, featured, isFeatured, is_featured, is_revenue_managed, isRevenueManaged, is_revenue_shared, isRevenueShared, ...rest } = dto as any;
    const episode: Partial<Episode> = { ...rest };

    const revenueManagedInput = is_revenue_managed !== undefined ? is_revenue_managed : (isRevenueManaged !== undefined ? isRevenueManaged : (is_revenue_shared !== undefined ? is_revenue_shared : isRevenueShared));
    if (revenueManagedInput !== undefined) {
      episode.is_revenue_managed = parseBool(revenueManagedInput);
    }

    const freeInput = free !== undefined ? free : (isFree !== undefined ? isFree : is_free);
    if (freeInput !== undefined) {
      episode.free = parseBool(freeInput);
    }

    const featuredInput = featured !== undefined ? featured : (isFeatured !== undefined ? isFeatured : is_featured);
    if (featuredInput !== undefined) {
      episode.featured = parseBool(featuredInput);
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
      title: e.title,
      slug: e.slug,
      shortDescription: e.description_short,
      longDescription: e.description_long,
      duration: e.duration,
      languages: e.languages,
      rating: e.rating ? parseFloat(e.rating.toString()) : null,
      isFeatured: isFeaturedBool,
      isFree: isFreeBool,
      isComingSoon: e.is_coming_soon,
      is_coming_soon: e.is_coming_soon,
      is_revenue_managed: parseBool(e.is_revenue_managed),
      is_svod_eligible: parseBool(e.is_svod_eligible),
      revenue_share_percent: e.revenue_share_percent ? parseFloat(e.revenue_share_percent.toString()) : null,
      price: e.price ? parseFloat(e.price.toString()) : null,
      currency: e.currency,
      viewCount: e.view_count,
      subtitles: e.subtitles,
      audio_tracks: e.audio_tracks,
      media: {
        image: { url: e.image || '', alt: e.poster_alt || '' },
        poster_image: { url: e.poster_image || '', alt: '' },
        card_image: { url: e.card_image || '', alt: '' },
        video: { url: e.url || '', alt: '' },
        trailer: { url: e.trailer_url || '', alt: e.trailer_alt || '' },
      },
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    };
  }
}
