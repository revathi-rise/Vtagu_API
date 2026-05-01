import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly service: FaqsService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return { status: true, message: 'FAQs fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.service.findOne(+id);
      return { status: true, message: 'FAQ fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Post()
  async create(@Body() dto: CreateFaqDto) {
    try {
      const data = await this.service.create(dto);
      return { status: true, message: 'FAQ created successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    try {
      const data = await this.service.update(+id, dto);
      return { status: true, message: 'FAQ updated successfully', data };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(+id);
      return { status: true, message: 'FAQ deleted successfully', data: null };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }
}
