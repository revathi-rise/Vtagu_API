import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ActorsService } from './actors.service';
import { CreateActorDto, UpdateActorDto } from './dto/actor.dto';

@Controller('actors')
export class ActorsController {
  constructor(private readonly service: ActorsService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return { status: true, message: 'Actors fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.service.findOne(+id);
      return { status: true, message: 'Actor fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Post()
  async create(@Body() dto: CreateActorDto) {
    try {
      const data = await this.service.create(dto);
      return { status: true, message: 'Actor created successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateActorDto) {
    try {
      const data = await this.service.update(+id, dto);
      return { status: true, message: 'Actor updated successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(+id);
      return { status: true, message: 'Actor deleted successfully', data: null };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }
}
