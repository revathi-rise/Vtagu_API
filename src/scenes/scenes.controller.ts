import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ScenesService } from './scenes.service';
import { CreateSceneDto, UpdateSceneDto } from './dto/scene.dto';

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

  @Post()
  async create(@Body() createSceneDto: CreateSceneDto) {
    const scene = await this.scenesService.create(createSceneDto);
    return {
      status: 'success',
      data: scene,
    };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateSceneDto: UpdateSceneDto) {
    const scene = await this.scenesService.update(id, updateSceneDto);
    return {
      status: 'success',
      data: scene,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.scenesService.remove(id);
    return {
      status: 'success',
      message: 'Scene deleted successfully',
    };
  }
}
