import { Controller, Get, Query } from '@nestjs/common';
import { PostersService } from './posters.service';

@Controller('posters')
export class PostersController {
  constructor(private readonly postersService: PostersService) {}

  @Get()
  getAll(@Query('limit') limit?: string) {
    const l = limit ? parseInt(limit, 10) : undefined;
    return this.postersService.findAll(l);
  }
}
