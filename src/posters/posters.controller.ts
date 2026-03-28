import { Controller, Get, Query } from '@nestjs/common';
import { PostersService } from './posters.service';

@Controller('posters')
export class PostersController {
  constructor(private readonly postersService: PostersService) {}

  @Get()
  async getAll(@Query('limit') limit?: string) {
    try {
      const l = limit ? parseInt(limit, 10) : undefined;
      const data = await this.postersService.findAll(l);
      return { status: true, message: 'Posters fetched successfully', data };
    } catch (error) {
      return { status: false, message: error.message || 'An error occurred', data: null };
    }
  }
}
