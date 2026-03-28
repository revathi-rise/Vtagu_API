import { Controller, Get, Query, Post, Body, MethodNotAllowedException } from '@nestjs/common';
import { InteractiveMoviesService } from './interactive-movies.service';

@Controller('interactive-movies')
export class InteractiveMoviesController {
  constructor(private service: InteractiveMoviesService) { }

  @Get('trending')
  async getForHome(@Query('limit') limit?: string) {
    try {
      const l = limit ? parseInt(limit, 10) : 10;
      const data = await this.service.findForHome(l);
      return { status: true, message: 'Interactive movies fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Get()
  async getAll() {
    try {
      const data = await this.service.findAll();
      return { status: true, message: 'Interactive movies fetched successfully', data };
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
