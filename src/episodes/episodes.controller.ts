import {
  Controller, Get, Post, Body, Param, Patch, Delete,
  Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { CreateEpisodeDto, UpdateEpisodeDto } from './episode.dto';

@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEpisodeDto) {
    const data = await this.episodesService.create(dto);
    return { status: true, message: 'Episode created successfully', data };
  }

  @Get()
  async findAll(@Query('season_id') seasonId?: string) {
    const data = await this.episodesService.findAll(
      seasonId ? Number(seasonId) : undefined,
    );
    return { status: true, message: 'Episodes fetched successfully', data };
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    const data = await this.episodesService.findOne(idOrSlug);
    return { status: true, message: 'Episode fetched successfully', data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEpisodeDto) {
    const data = await this.episodesService.update(Number(id), dto);
    return { status: true, message: 'Episode updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.episodesService.remove(Number(id));
    return { status: true, message: 'Episode deleted successfully', data: null };
  }
}
