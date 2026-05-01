import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SeriesService } from './series.service';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/series.dto';

@Controller('series')
export class SeriesController {
  constructor(private readonly service: SeriesService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return { status: true, message: 'Series fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.service.findOne(+id);
      return { status: true, message: 'Series fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Post()
  async create(@Body() dto: CreateSeriesDto) {
    try {
      const data = await this.service.create(dto);
      return { status: true, message: 'Series created successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSeriesDto) {
    try {
      const data = await this.service.update(+id, dto);
      return { status: true, message: 'Series updated successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(+id);
      return { status: true, message: 'Series deleted successfully', data: null };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }
}
