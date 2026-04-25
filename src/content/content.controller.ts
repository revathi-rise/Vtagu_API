import { Controller, Get, Param, Delete } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  findAll() {
    return this.contentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(+id);
  }
}
