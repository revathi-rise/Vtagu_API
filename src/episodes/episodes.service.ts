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

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
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

  async findAll(seasonId?: number, userId?: number): Promise<EpisodeResponseDto[]> {
    const where = seasonId ? { season_id: seasonId } : {};
    const episodes = await this.episodeRepository.find({
      where,
      order: { season_id: 'ASC', episode_number: 'ASC' },
    });
    const hasSubAccess = userId ? await this.checkStandardAccess(userId) : false;
    return episodes.map(e => {
      const isFree = parseBool(e.free);
      const hasAccess = isFree || hasSubAccess;
      const res = this.mapToResponse(e);
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

  async findOne(idOrSlug: string | number, userId?: number): Promise<EpisodeResponseDto> {
    let episode: Episode;
    if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
      episode = await this.episodeRepository.findOneBy({ episode_id: Number(idOrSlug) });
    } else {
      episode = await this.episodeRepository.findOneBy({ slug: String(idOrSlug) });
    }
    if (!episode) throw new NotFoundException('Episode not found');

    const isFree = parseBool(episode.free);
    let hasAccess = isFree;
    if (!isFree && userId) {
      hasAccess = await this.checkStandardAccess(userId);
    }

    const response = this.mapToResponse(episode);
    if (!hasAccess) {
      if (response.media && response.media.video) {
        response.media.video.url = "";
      }
    }
    return response;
  }

  async update(id: number, dto: UpdateEpisodeDto): Promise<EpisodeResponseDto> {
    const episode = await this.episodeRepository.findOneBy({ episode_id: id });
    if (!episode) throw new NotFoundException('Episode not found');
    const updateData = this.mapFromDto(dto);
    Object.assign(episode, updateData);
    const updated = await this.episodeRepository.save(episode);
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
    const { media, free, isFree, is_free, featured, isFeatured, is_featured, ...rest } = dto as any;
    const episode: Partial<Episode> = { ...rest };

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
      featured: isFeaturedBool,
      isFree: isFreeBool,
      free: isFreeBool,
      is_free: isFreeBool,
      isComingSoon: e.is_coming_soon,
      is_coming_soon: e.is_coming_soon,
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
