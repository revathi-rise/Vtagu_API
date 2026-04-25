import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ScenesService } from './scenes.service';

@Controller('scenes')
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Get()
  async findByMovie(@Query('id', ParseIntPipe) id: number) {
    const scenes = await this.scenesService.findByMovieId(id);
    return {
      status: 'success',
      total_count: scenes.length,
      data: scenes,
    };
  }
}
