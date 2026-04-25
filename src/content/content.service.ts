import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async findAll(): Promise<Content[]> {
    return this.contentRepository.find();
  }

  async findOne(id: number): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { content_id: id } });
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async remove(id: number): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepository.remove(content);
  }
}
