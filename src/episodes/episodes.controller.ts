import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { CreateEpisodeDto, UpdateEpisodeDto } from './episode.dto';

@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Post()
  create(@Body() createEpisodeDto: CreateEpisodeDto) {
    return this.episodesService.create(createEpisodeDto);
  }

  @Get()
  findAll() {
    return this.episodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.episodesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEpisodeDto: UpdateEpisodeDto) {
    return this.episodesService.update(Number(id), updateEpisodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.episodesService.remove(Number(id));
  }
}
