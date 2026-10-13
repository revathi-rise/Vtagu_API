import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, ParseIntPipe, Req } from '@nestjs/common';
import { PostersService } from './posters.service';
import { CreatePosterDto, UpdatePosterDto } from './dto/poster.dto';

@Controller(['posters', 'banners'])
export class PostersController {
  constructor(private readonly postersService: PostersService) {}

  @Get()
  async getAll(
    @Query('limit') limit?: string,
    @Query('page_type') pageType?: string,
    @Query('pageType') altPageType?: string,
    @Query('language') language?: string,
    @Query('userId') userId?: string,
    @Query('kidsMode') kidsMode?: string,
    @Req() req?: any,
  ) {
    try {
      const l = limit ? parseInt(limit, 10) : undefined;
      const targetPageType = pageType || altPageType;
      const parsedUserId = userId ? parseInt(userId, 10) : undefined;
      const authHeader = req?.headers?.['authorization'];
      const kidsHeader = req?.headers?.['x-kids-mode'];
      const isKids = await this.postersService.isKidsModeActive(parsedUserId, authHeader, kidsMode, kidsHeader);
      const data = await this.postersService.findAll(l, targetPageType, language, isKids);
      return { status: true, message: 'Posters fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Get(':slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query('language') language?: string,
    @Query('userId') userId?: string,
    @Query('kidsMode') kidsMode?: string,
    @Req() req?: any,
  ) {
    try {
      const id = parseInt(slug, 10);
      if (!isNaN(id) && /^\d+$/.test(slug)) {
        const data = await this.postersService.findOne(id);
        return { status: true, message: 'Poster fetched successfully', data };
      } else {
        const parsedUserId = userId ? parseInt(userId, 10) : undefined;
        const authHeader = req?.headers?.['authorization'];
        const kidsHeader = req?.headers?.['x-kids-mode'];
        const isKids = await this.postersService.isKidsModeActive(parsedUserId, authHeader, kidsMode, kidsHeader);
        const data = await this.postersService.findByPageType(slug, language, isKids);
        return { status: true, message: 'Posters fetched successfully', data };
      }
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Post()
  async create(@Body() createDto: CreatePosterDto) {
    try {
      const data = await this.postersService.create(createDto);
      return { status: true, message: 'Poster created successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePosterDto,
  ) {
    try {
      const data = await this.postersService.update(id, updateDto);
      return { status: true, message: 'Poster updated successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePosterDto,
  ) {
    try {
      const data = await this.postersService.update(id, updateDto);
      return { status: true, message: 'Poster updated successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.postersService.remove(id);
      return { status: true, message: 'Poster deleted successfully' };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred' };
    }
  }
}
