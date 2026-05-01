import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly service: NewsService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return { status: true, message: 'News fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.service.findOne(+id);
      return { status: true, message: 'News fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Post()
  async create(@Body() dto: CreateNewsDto) {
    try {
      const data = await this.service.create(dto);
      return { status: true, message: 'News created successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    try {
      const data = await this.service.update(+id, dto);
      return { status: true, message: 'News updated successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(+id);
      return { status: true, message: 'News deleted successfully', data: null };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }
}
