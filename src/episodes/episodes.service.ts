import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Episode } from './episode.entity';
import { CreateEpisodeDto, EpisodeResponseDto, UpdateEpisodeDto } from './episode.dto';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
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
    const episode = this.episodeRepository.create(dto);
    const saved = await this.episodeRepository.save(episode);
    return this.mapToResponse(saved);
  }

  async findAll(seasonId?: number): Promise<EpisodeResponseDto[]> {
    const where = seasonId ? { season_id: seasonId } : {};
    const episodes = await this.episodeRepository.find({
      where,
      order: { season_id: 'ASC', episode_number: 'ASC' },
    });
    return episodes.map(e => this.mapToResponse(e));
  }

  async findOne(idOrSlug: string | number): Promise<EpisodeResponseDto> {
    let episode: Episode;
    if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
      episode = await this.episodeRepository.findOneBy({ episode_id: Number(idOrSlug) });
    } else {
      episode = await this.episodeRepository.findOneBy({ slug: String(idOrSlug) });
    }
    if (!episode) throw new NotFoundException('Episode not found');
    return this.mapToResponse(episode);
  }

  async update(id: number, dto: UpdateEpisodeDto): Promise<EpisodeResponseDto> {
    const episode = await this.episodeRepository.findOneBy({ episode_id: id });
    if (!episode) throw new NotFoundException('Episode not found');
    Object.assign(episode, dto);
    const updated = await this.episodeRepository.save(episode);
    return this.mapToResponse(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.episodeRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Episode not found');
  }

  public mapToResponse(e: Episode): EpisodeResponseDto {
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
      isFeatured: e.featured,
      isFree: e.free,
      viewCount: e.view_count,
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
