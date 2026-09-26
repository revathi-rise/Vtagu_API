import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, Req, BadRequestException } from '@nestjs/common';
import { ScenesService } from './scenes.service';
import { CreateSceneDto, UpdateSceneDto } from './dto/scene.dto';

@Controller('scenes')
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Get()
  async findByMovie(
    @Query('id') idStr?: string,
    @Query('movie_id') movieIdStr?: string,
    @Query('userId') userIdStr?: string,
    @Query('admin') adminStr?: string,
    @Req() req?: any,
  ) {
    const rawId = idStr || movieIdStr;
    if (!rawId) {
      throw new BadRequestException('Movie ID (id or movie_id) is required');
    }
    const id = parseInt(rawId, 10);
    let parsedUserId = userIdStr ? parseInt(userIdStr, 10) : undefined;
    let isAdmin = adminStr === 'true' || adminStr === '1';

    const authHeader = req?.headers?.['authorization'] || req?.headers?.['x-admin-token'];
    const originHeader = req?.headers?.['origin'] || req?.headers?.['referer'];
    if (originHeader && typeof originHeader === 'string' && originHeader.toLowerCase().includes('admin')) {
      isAdmin = true;
    }

    if (authHeader && typeof authHeader === 'string') {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const user = await this.scenesService.getUserBySessionToken(token);
        if (user) {
          if (!parsedUserId) {
            parsedUserId = user.userId;
          }
          if (String(user.type) === '1' || String(user.type) === '2') {
            isAdmin = true;
          }
        }
      }
    }

    const scenes = await this.scenesService.findByMovieId(id, parsedUserId, isAdmin);
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
