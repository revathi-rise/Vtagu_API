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

    if (!isAdmin && parsedUserId) {
      const user = await this.scenesService.getUserById(parsedUserId);
      if (user && (String(user.type) === '1' || String(user.type) === '2')) {
        isAdmin = true;
      }
    }

    const scenes = await this.scenesService.findByMovieId(id, parsedUserId, isAdmin);
    return {
      status: 'success',
      total_count: scenes.length,
      data: scenes,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const scene = await this.scenesService.findOne(id);
    return {
      status: 'success',
      data: scene,
    };
  }

  private extractAuditContext(req?: any): { userId?: number; userEmail?: string; ipAddress?: string } {
    const rawIp = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || req?.ip || '127.0.0.1';
    const ipAddress = Array.isArray(rawIp) ? rawIp[0] : String(rawIp).split(',')[0].trim();
    let userEmail = 'admin@vtagu.com';
    let userId = 1;
    if (req?.user?.email) userEmail = req.user.email;
    if (req?.user?.userId || req?.user?.id) userId = req.user.userId || req.user.id;
    return { userId, userEmail, ipAddress };
  }

  @Post()
  async create(@Body() createSceneDto: CreateSceneDto, @Req() req?: any) {
    const context = this.extractAuditContext(req);
    const scene = await this.scenesService.create(createSceneDto, context);
    return {
      status: 'success',
      data: scene,
    };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateSceneDto: UpdateSceneDto, @Req() req?: any) {
    const context = this.extractAuditContext(req);
    const scene = await this.scenesService.update(id, updateSceneDto, context);
    return {
      status: 'success',
      data: scene,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req?: any) {
    const context = this.extractAuditContext(req);
    await this.scenesService.remove(id, context);
    return {
      status: 'success',
      message: 'Scene deleted successfully',
    };
  }
}
