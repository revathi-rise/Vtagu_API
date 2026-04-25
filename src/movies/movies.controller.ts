import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
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
  async findAll(): Promise<{ status: boolean; message: string; data: MovieResponseDto[] }> {
    try {
      const data = await this.moviesService.findAll();
      return { status: true, message: 'Movies fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Get('trending')
  async getTrending(@Query('limit') limit?: string) {
    try {
      const l = limit ? parseInt(limit, 10) : 10;
      const data = await this.moviesService.findForHome(l);
      return { status: true, message: 'Trending movies fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<{ status: boolean; message: string; data: MovieResponseDto }> {
    try {
      const data = await this.moviesService.findOneBySlug(slug);
      return { status: true, message: 'Movie fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Put(':id')
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
}
