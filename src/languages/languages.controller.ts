import { Controller, Get, Post, Body, Put, Delete, Param, Query } from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    const includeHidden = all === 'true' || all === '1';
    const data = await this.languagesService.findAll(includeHidden);
    return { status: true, message: 'Languages fetched successfully', data };
  }

  @Post()
  async create(@Body() body: { name: string; code: string; slug?: string; is_visible?: boolean }) {
    const data = await this.languagesService.create(body);
    return { status: true, message: 'Language created successfully', data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; code?: string; slug?: string; is_visible?: boolean }
  ) {
    const data = await this.languagesService.update(+id, body);
    return { status: true, message: 'Language updated successfully', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.languagesService.remove(+id);
  }

  @Get(':slug/movies')
  async getMoviesByLanguage(@Param('slug') slug: string) {
    return this.languagesService.getMovies(slug);
  }
}
