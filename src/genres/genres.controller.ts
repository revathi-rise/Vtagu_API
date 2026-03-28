import { Controller, Get, Query, Post, MethodNotAllowedException } from '@nestjs/common';
import { GenresService } from './genres.service';

@Controller('genres')
export class GenresController {
  constructor(private service: GenresService) { }

  @Get('home')
  async getForHome(@Query('limit') limit?: string) {
    try {
      const l = limit ? parseInt(limit, 10) : 10;
      const data = await this.service.findForHome(l);
      return { status: true, message: 'Genres fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Get()
  async getAll() {
    try {
      const data = await this.service.findAll();
      return { status: true, message: 'Genres fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Post()
  create() {
    try {
      throw new MethodNotAllowedException('Write operations are disabled');
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }
}
