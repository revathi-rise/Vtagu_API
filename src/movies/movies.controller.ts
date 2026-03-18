import { Controller, Get, Query, Post, Body, MethodNotAllowedException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './movie.entity';

@Controller('movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) { }

  // GET /api/movies/home?limit=6
  @Get('trending')
  getForHome(@Query('limit') limit?: string) {
    const l = limit ? parseInt(limit, 10) : 10;
    return this.moviesService.findForHome(l);
  }

  // generic endpoints
  @Get()
  getAll() {
    return this.moviesService.findAll();
  }

  @Post()
  create() {
    throw new MethodNotAllowedException('Write operations are disabled');
  }
}
