import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PostersService } from './posters.service';
import { CreatePosterDto, UpdatePosterDto } from './dto/poster.dto';

@Controller('posters')
export class PostersController {
  constructor(private readonly postersService: PostersService) {}

  @Get()
  async getAll(
    @Query('limit') limit?: string,
    @Query('page_type') pageType?: string,
    @Query('language') language?: string,
  ) {
    try {
      const l = limit ? parseInt(limit, 10) : undefined;
      const data = await this.postersService.findAll(l, pageType, language);
      return { status: true, message: 'Posters fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.postersService.findOne(id);
      return { status: true, message: 'Poster fetched successfully', data };
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
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePosterDto) {
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
      return { status: true, message: 'Poster deleted successfully', data: null };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }
}
