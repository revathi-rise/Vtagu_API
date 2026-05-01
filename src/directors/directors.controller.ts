import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DirectorsService } from './directors.service';
import { CreateDirectorDto, UpdateDirectorDto } from './dto/director.dto';

@Controller('directors')
export class DirectorsController {
  constructor(private readonly service: DirectorsService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return { status: true, message: 'Directors fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.service.findOne(+id);
      return { status: true, message: 'Director fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Post()
  async create(@Body() dto: CreateDirectorDto) {
    try {
      const data = await this.service.create(dto);
      return { status: true, message: 'Director created successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDirectorDto) {
    try {
      const data = await this.service.update(+id, dto);
      return { status: true, message: 'Director updated successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(+id);
      return { status: true, message: 'Director deleted successfully', data: null };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }
}
