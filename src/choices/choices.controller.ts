import { Controller, Get, Post, Put, Delete, Body, Query, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ChoicesService } from './choices.service';
import { CreateChoiceDto, UpdateChoiceDto } from './dto/choice.dto';

@Controller('choices')
export class ChoicesController {
  constructor(private readonly choicesService: ChoicesService) {}

  @Get()
  async findAll(@Query('scene_id') sceneId?: string, @Query('id') id?: string) {
    if (id) {
      return this.choicesService.findOne(+id);
    }
    const scene_id = sceneId ? +sceneId : undefined;
    return this.choicesService.findAll(scene_id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createChoiceDto: CreateChoiceDto) {
    return this.choicesService.create(createChoiceDto);
  }

  @Put()
  async update(@Body() updateChoiceDto: UpdateChoiceDto) {
    return this.choicesService.update(updateChoiceDto);
  }

  @Delete(':id')
  async removeWithParam(@Param('id', ParseIntPipe) id: number) {
    await this.choicesService.remove(id);
    return { deleted: true };
  }

  @Delete()
  async remove(@Body('choice_id') choiceId?: number, @Query('id') id?: number) {
    const targetId = choiceId || id;
    if (!targetId) {
      return { error: 'choice_id required' };
    }
    await this.choicesService.remove(targetId);
    return { deleted: true };
  }
}
