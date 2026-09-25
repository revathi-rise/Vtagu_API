import { Controller, Get, Post, Body, Put, Param, Delete, Query, ParseIntPipe, Req } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto, UpdateMovieDto, MovieResponseDto } from './movies.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Post()
  async create(@Body() createMovieDto: CreateMovieDto): Promise<{ status: boolean; message: string; data: MovieResponseDto }> {
    try {
      const data = await this.moviesService.create(createMovieDto);
      return { status: true, message: 'Movie created successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Get()
  async findAll(
    @Query('language') language?: string,
    @Query('userId') userId?: string,
    @Query('admin') admin?: string,
    @Req() req?: any,
  ): Promise<{ status: boolean; message: string; data: MovieResponseDto[] }> {
    try {
      const parsedUserId = userId ? parseInt(userId, 10) : undefined;
      const isAdminQuery = admin === 'true' || admin === '1';
      const authHeader = req?.headers?.['authorization'] || req?.headers?.['x-admin-token'];
      const originHeader = req?.headers?.['origin'] || req?.headers?.['referer'];
      const data = await this.moviesService.findAll(language, parsedUserId, isAdminQuery, authHeader, originHeader);
      return { status: true, message: 'Movies fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Get('trending')
  async getTrending(
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('admin') admin?: string,
    @Req() req?: any,
  ) {
    try {
      const l = limit ? parseInt(limit, 10) : 10;
      const parsedUserId = userId ? parseInt(userId, 10) : undefined;
      const isAdminQuery = admin === 'true' || admin === '1';
      const authHeader = req?.headers?.['authorization'] || req?.headers?.['x-admin-token'];
      const originHeader = req?.headers?.['origin'] || req?.headers?.['referer'];
      const data = await this.moviesService.findForHome(l, parsedUserId, isAdminQuery, authHeader, originHeader);
      return { status: true, message: 'Trending movies fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Query('userId') userId?: string,
    @Query('admin') admin?: string,
    @Req() req?: any,
  ): Promise<{ status: boolean; message: string; data: MovieResponseDto }> {
    try {
      const parsedUserId = userId ? parseInt(userId, 10) : undefined;
      const isAdminQuery = admin === 'true' || admin === '1';
      const authHeader = req?.headers?.['authorization'] || req?.headers?.['x-admin-token'];
      const originHeader = req?.headers?.['origin'] || req?.headers?.['referer'];
      const data = await this.moviesService.findOneBySlug(slug, parsedUserId, isAdminQuery, authHeader, originHeader);
      return { status: true, message: 'Movie fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Put(':id')
  @Post(':id')
  async update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto): Promise<{ status: boolean; message: string; data: MovieResponseDto }> {
    try {
      const data = await this.moviesService.update(+id, updateMovieDto);
      return { status: true, message: 'Movie updated successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ status: boolean; message: string; data: null }> {
    try {
      await this.moviesService.remove(+id);
      return { status: true, message: 'Movie deleted successfully', data: null };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Post(':id/view')
  async incrementView(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ status: boolean; message: string }> {
    try {
      await this.moviesService.incrementView(id);
      return { status: true, message: 'View count incremented' };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred' };
    }
  }
}
