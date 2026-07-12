import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchProgress, ContentType } from './entities/watch-progress.entity';
import { SaveWatchProgressDto } from './dto/watch-progress.dto';
import { Movie } from '../movies/movie.entity';
import { Episode } from '../episodes/episode.entity';

@Injectable()
export class WatchProgressService {
  constructor(
    @InjectRepository(WatchProgress)
    private watchProgressRepository: Repository<WatchProgress>,
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    @InjectRepository(Episode)
    private episodesRepository: Repository<Episode>,
  ) {}

  /**
   * Save or update watch progress
   */
  async saveProgress(dto: SaveWatchProgressDto): Promise<WatchProgress> {
    const { userId, contentId, contentType } = dto;

    let progress = await this.watchProgressRepository.findOne({
      where: { userId, contentId, contentType },
    });

    if (!progress) {
      progress = this.watchProgressRepository.create(dto);
    } else {
      Object.assign(progress, dto);
    }

    return this.watchProgressRepository.save(progress);
  }

  /**
   * Get all progress for a user with content details
   */
  async getUserProgress(userId: number): Promise<any[]> {
    const progresses = await this.watchProgressRepository.find({
      where: { userId },
      order: { lastWatchedAt: 'DESC' },
    });

    const result = await Promise.all(
      progresses.map(async (p) => {
        let contentInfo = null;
        if (p.contentType === ContentType.MOVIE) {
          contentInfo = await this.moviesRepository.findOne({
            where: { movie_id: p.contentId },
            select: ['movie_id', 'title', 'movie_image', 'duration'],
          });
        } else if (p.contentType === ContentType.EPISODE) {
          contentInfo = await this.episodesRepository.findOne({
            where: { episode_id: p.contentId },
            select: ['episode_id', 'title', 'image'],
          });
        }

        return {
          ...p,
          content: contentInfo,
        };
      }),
    );

    return result.filter((item) => item.content !== null);
  }

  /**
   * Get watch progress for a specific content item
   */
  async getContentProgress(
    userId: number,
    contentId: number,
    contentType?: ContentType,
  ): Promise<WatchProgress | null> {
    const where: any = { userId, contentId };
    if (contentType) {
      where.contentType = contentType;
    }
    return this.watchProgressRepository.findOne({
      where,
      order: { lastWatchedAt: 'DESC' },
    });
  }

  /**
   * Delete watch progress record by ID
   */
  async deleteProgress(id: number): Promise<void> {
    const result = await this.watchProgressRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Watch progress with ID ${id} not found`);
    }
  }

  /**
   * Clear all watch progress for a user
   */
  async clearUserProgress(userId: number): Promise<void> {
    await this.watchProgressRepository.delete({ userId });
  }
}
