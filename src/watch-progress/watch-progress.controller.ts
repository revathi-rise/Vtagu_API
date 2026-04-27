import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { WatchProgressService } from './watch-progress.service';
import { SaveWatchProgressDto } from './dto/watch-progress.dto';

@Controller('watch-progress')
export class WatchProgressController {
  constructor(private readonly watchProgressService: WatchProgressService) {}

  /**
   * Save or update watch progress
   * POST /watch-progress
   */
  @Post()
  async saveProgress(@Body() dto: SaveWatchProgressDto) {
    return this.watchProgressService.saveProgress(dto);
  }

  /**
   * Get watch progress for a user
   * GET /watch-progress/user/:userId
   */
  @Get('user/:userId')
  async getUserProgress(@Param('userId') userId: string) {
    return this.watchProgressService.getUserProgress(Number(userId));
  }
}
