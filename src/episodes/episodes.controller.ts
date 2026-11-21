import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  Query, HttpCode, HttpStatus, ParseIntPipe, Req,
} from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { CreateEpisodeDto, UpdateEpisodeDto } from './episode.dto';

@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEpisodeDto) {
    try {
      const data = await this.episodesService.create(dto);
      return { status: true, message: 'Episode created successfully', data };
    } catch (error: any) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Get()
  async findAll(
    @Query('season_id') seasonId?: string,
    @Query('userId') userId?: string,
    @Query('admin') admin?: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ) {
    try {
      const isAdminQuery = admin === 'true' || admin === '1';
      const parsedLimit = limit ? Math.min(parseInt(limit, 10), 500) : undefined;
      const authHeader = req?.headers?.['authorization'] || req?.headers?.['x-admin-token'];
      const originHeader = req?.headers?.['origin'] || req?.headers?.['referer'];
      const data = await this.episodesService.findAll(
        seasonId ? Number(seasonId) : undefined,
        userId ? Number(userId) : undefined,
        isAdminQuery,
        authHeader,
        originHeader,
        parsedLimit,
      );
      return { status: true, message: 'Episodes fetched successfully', data };
    } catch (error: any) {
      console.error('Error fetching episodes:', error);
      return { status: false, message: error.message || 'An error occurred', data: [] };
    }
  }

  @Get(':idOrSlug')
  async findOne(
    @Param('idOrSlug') idOrSlug: string,
    @Query('userId') userId?: string,
    @Query('admin') admin?: string,
    @Req() req?: any,
  ) {
    try {
      const isAdminQuery = admin === 'true' || admin === '1';
      const authHeader = req?.headers?.['authorization'] || req?.headers?.['x-admin-token'];
      const originHeader = req?.headers?.['origin'] || req?.headers?.['referer'];
      const data = await this.episodesService.findOne(
        idOrSlug,
        userId ? Number(userId) : undefined,
        isAdminQuery,
        authHeader,
        originHeader,
      );
      return { status: true, message: 'Episode fetched successfully', data };
    } catch (error: any) {
      console.error(`Error fetching episode ${idOrSlug}:`, error);
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEpisodeDto) {
    try {
      const data = await this.episodesService.update(Number(id), dto);
      return { status: true, message: 'Episode updated successfully', data };
    } catch (error: any) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    try {
      await this.episodesService.remove(Number(id));
      return { status: true, message: 'Episode deleted successfully', data: null };
    } catch (error: any) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Post(':id/view')
  async incrementView(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ status: boolean; message: string }> {
    try {
      await this.episodesService.incrementView(id);
      return { status: true, message: 'View count incremented' };
    } catch (error: any) {
      return { status: false, message: error.message || 'An error occurred' };
    }
  }
}
