import { Controller, Get, Param } from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  async findAll() {
    return this.languagesService.findAll();
  }

  @Get(':slug/movies')
  async getMoviesByLanguage(@Param('slug') slug: string) {
    return this.languagesService.getMovies(slug);
  }
}
