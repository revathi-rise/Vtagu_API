import { Controller, Post, Get, Delete, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { WatchProgressService } from './watch-progress.service';
import { SaveWatchProgressDto } from './dto/watch-progress.dto';
import { ContentType } from './entities/watch-progress.entity';

@Controller('watch-progress')
export class WatchProgressController {
  constructor(private readonly watchProgressService: WatchProgressService) {}

  /**
   * Save or update watch progress
   * POST /watch-progress
   */
  @Post()
  async saveProgress(@Body() dto: SaveWatchProgressDto) {
    try {
      const data = await this.watchProgressService.saveProgress(dto);
      return {
        status: true,
        message: 'Watch progress saved successfully',
        data,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to save watch progress',
        data: null,
      };
    }
  }

  /**
   * Get watch progress (supports filtering by query params, e.g. for general fallback requests)
   * GET /watch-progress
   */
  @Get()
  async getProgress(
    @Query('userId') userId?: string,
    @Query('contentId') contentId?: string,
    @Query('contentType') contentType?: ContentType,
  ) {
    try {
      if (userId && contentId) {
        const progress = await this.watchProgressService.getContentProgress(
          Number(userId),
          Number(contentId),
          contentType,
        );
        return {
          status: true,
          message: 'Watch progress fetched successfully',
          data: progress,
        };
      } else if (userId) {
        const data = await this.watchProgressService.getUserProgress(Number(userId));
        return {
          status: true,
          message: 'User watch progress list fetched successfully',
          data,
        };
      }
      return {
        status: true,
        message: 'No filtering query parameters provided',
        data: [],
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to fetch watch progress',
        data: null,
      };
    }
  }

  /**
   * Get watch progress for a user
   * GET /watch-progress/user/:userId
   */
  @Get('user/:userId')
  async getUserProgress(@Param('userId') userId: string) {
    try {
      const data = await this.watchProgressService.getUserProgress(Number(userId));
      return {
        status: true,
        message: 'User watch progress list fetched successfully',
        data,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to fetch user watch progress list',
        data: [],
      };
    }
  }

  /**
   * Get progress for a specific content item
   * GET /watch-progress/user/:userId/content/:contentId
   */
  @Get('user/:userId/content/:contentId')
  async getContentProgress(
    @Param('userId') userId: string,
    @Param('contentId') contentId: string,
    @Query('contentType') contentType?: ContentType,
  ) {
    try {
      const progress = await this.watchProgressService.getContentProgress(
        Number(userId),
        Number(contentId),
        contentType,
      );
      if (!progress) {
        return {
          status: false,
          message: 'Watch progress not found for this content',
          data: null,
        };
      }
      return {
        status: true,
        message: 'Watch progress fetched successfully',
        data: progress,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to fetch watch progress',
        data: null,
      };
    }
  }

  /**
   * Delete watch progress record
   * DELETE /watch-progress/:id
   */
  @Delete(':id')
  async deleteProgress(@Param('id') id: string) {
    try {
      await this.watchProgressService.deleteProgress(Number(id));
      return {
        status: true,
        message: 'Watch progress deleted successfully',
        data: null,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to delete watch progress',
        data: null,
      };
    }
  }

  /**
   * Clear all progress for a user
   * DELETE /watch-progress/user/:userId
   */
  @Delete('user/:userId')
  async clearUserProgress(@Param('userId') userId: string) {
    try {
      await this.watchProgressService.clearUserProgress(Number(userId));
      return {
        status: true,
        message: 'User watch progress cleared successfully',
        data: null,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Failed to clear user watch progress',
        data: null,
      };
    }
  }
}
