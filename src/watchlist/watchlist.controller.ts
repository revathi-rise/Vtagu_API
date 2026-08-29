import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { AddToWatchlistDto, RemoveFromWatchlistDto } from './dto/watchlist.dto';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  /**
   * Add item to watchlist
   * POST /watchlist/add
   */
  @Post('add')
  async addToWatchlist(@Body() dto: AddToWatchlistDto) {
    return this.watchlistService.addToWatchlist(dto);
  }

  /**
   * Remove item from watchlist
   * DELETE /watchlist/remove
   */
  @Delete('remove')
  async removeFromWatchlist(@Body() dto: RemoveFromWatchlistDto) {
    return this.watchlistService.removeFromWatchlist(dto);
  }

  /**
   * Toggle item in/out of watchlist
   * POST /watchlist/toggle
   */
  @Post('toggle')
  async toggleWatchlist(@Body() dto: AddToWatchlistDto) {
    return this.watchlistService.toggleWatchlist(dto);
  }

  /**
   * Check if item is in watchlist
   * GET /watchlist/check?userId=1&contentId=5&contentType=movie
   */
  @Get('check')
  async checkWatchlist(
    @Query('userId') userId: string,
    @Query('contentId') contentId: string,
    @Query('contentType') contentType?: string,
  ) {
    return this.watchlistService.checkWatchlist(
      Number(userId),
      Number(contentId),
      contentType || 'movie',
    );
  }

  /**
   * Get user watchlist with details
   * GET /watchlist/user/:userId
   */
  @Get('user/:userId')
  async getUserWatchlist(@Param('userId') userId: string) {
    return this.watchlistService.getUserWatchlist(Number(userId));
  }
}
