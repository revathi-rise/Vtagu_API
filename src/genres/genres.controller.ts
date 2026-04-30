import { Controller, Get, Query, Post, Put, Delete, Body, Param } from '@nestjs/common';
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
  async create(@Body() data: any) {
    try {
      const result = await this.service.create(data);
      return { status: true, message: 'Genre created successfully', data: result };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    try {
      const result = await this.service.update(+id, data);
      return { status: true, message: 'Genre updated successfully', data: result };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(+id);
      return { status: true, message: 'Genre deleted successfully', data: null };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }
}
