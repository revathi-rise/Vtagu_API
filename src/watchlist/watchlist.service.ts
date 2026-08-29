import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from './entities/watchlist.entity';
import { AddToWatchlistDto, RemoveFromWatchlistDto, WatchlistResponseDto } from './dto/watchlist.dto';
import { Movie } from '../movies/movie.entity';
import { Series } from '../series/entities/series.entity';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { Short } from '../shorts/short.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private watchlistRepository: Repository<Watchlist>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Series)
    private seriesRepository: Repository<Series>,
    @InjectRepository(InteractiveMovie)
    private interactiveMovieRepository: Repository<InteractiveMovie>,
    @InjectRepository(Short)
    private shortRepository: Repository<Short>,
  ) {}

  /**
   * Add item to user watchlist
   */
  async addToWatchlist(dto: AddToWatchlistDto): Promise<{ status: boolean; message: string; data: Watchlist }> {
    try {
      const contentType = dto.contentType || 'movie';
      const existing = await this.watchlistRepository.findOne({
        where: { userId: dto.userId, contentId: dto.contentId, contentType },
      });

      if (existing) {
        return {
          status: true,
          message: 'Item already in watchlist',
          data: existing,
        };
      }

      const newItem = this.watchlistRepository.create({
        userId: dto.userId,
        contentId: dto.contentId,
        contentType,
      });

      const saved = await this.watchlistRepository.save(newItem);
      return {
        status: true,
        message: 'Item added to watchlist successfully',
        data: saved,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Remove item from user watchlist
   */
  async removeFromWatchlist(dto: RemoveFromWatchlistDto): Promise<{ status: boolean; message: string }> {
    try {
      const contentType = dto.contentType || 'movie';
      await this.watchlistRepository.delete({
        userId: dto.userId,
        contentId: dto.contentId,
        contentType,
      });

      return {
        status: true,
        message: 'Item removed from watchlist successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Toggle item in/out of watchlist
   */
  async toggleWatchlist(dto: AddToWatchlistDto): Promise<{ status: boolean; message: string; inWatchlist: boolean }> {
    try {
      const contentType = dto.contentType || 'movie';
      const existing = await this.watchlistRepository.findOne({
        where: { userId: dto.userId, contentId: dto.contentId, contentType },
      });

      if (existing) {
        await this.watchlistRepository.delete(existing.id);
        return {
          status: true,
          message: 'Removed from watchlist',
          inWatchlist: false,
        };
      } else {
        const newItem = this.watchlistRepository.create({
          userId: dto.userId,
          contentId: dto.contentId,
          contentType,
        });
        await this.watchlistRepository.save(newItem);
        return {
          status: true,
          message: 'Added to watchlist',
          inWatchlist: true,
        };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Check if item is saved in user's watchlist
   */
  async checkWatchlist(userId: number, contentId: number, contentType: string = 'movie'): Promise<{ inWatchlist: boolean }> {
    try {
      const existing = await this.watchlistRepository.findOne({
        where: { userId, contentId, contentType },
      });

      return { inWatchlist: !!existing };
    } catch (error) {
      return { inWatchlist: false };
    }
  }

  /**
   * Get all watchlist items for user with details
   */
  async getUserWatchlist(userId: number): Promise<{ status: boolean; message: string; data: WatchlistResponseDto[] }> {
    try {
      const watchlistItems = await this.watchlistRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      const itemsWithDetails: WatchlistResponseDto[] = [];

      for (const item of watchlistItems) {
        let details: any = null;

        if (item.contentType === 'movie') {
          details = await this.movieRepository.findOne({ where: { movie_id: item.contentId } });
        } else if (item.contentType === 'series') {
          details = await this.seriesRepository.findOne({ where: { series_id: item.contentId } });
        } else if (item.contentType === 'interactive_movie') {
          details = await this.interactiveMovieRepository.findOne({ where: { interactive_movie_id: item.contentId } });
        } else if (item.contentType === 'short') {
          details = await this.shortRepository.findOne({ where: { short_id: item.contentId } });
        }

        itemsWithDetails.push({
          id: item.id,
          userId: item.userId,
          contentId: item.contentId,
          contentType: item.contentType,
          createdAt: item.createdAt,
          details,
        });
      }

      return {
        status: true,
        message: 'Watchlist fetched successfully',
        data: itemsWithDetails,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
