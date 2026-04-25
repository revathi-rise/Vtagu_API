import { Controller, Get } from '@nestjs/common';
import { InteractiveMoviesService } from './interactive-movies.service';

@Controller('interactive-movies')
export class InteractiveMoviesController {
  constructor(private readonly moviesService: InteractiveMoviesService) {}

  @Get()
  async findAll() {
    try {
      const movies = await this.moviesService.findAll();
      return {
        status: 'success',
        total_count: movies.length,
        data: movies,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
