import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private repository: Repository<News>,
  ) {}

  async findAll(): Promise<News[]> {
    return this.repository.find({ order: { created_on: 'DESC' } });
  }

  async findOne(id: number): Promise<News> {
    const news = await this.repository.findOne({ where: { news_id: id } });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  async create(dto: CreateNewsDto): Promise<News> {
    const news = this.repository.create(dto);
    return this.repository.save(news);
  }

  async update(id: number, dto: UpdateNewsDto): Promise<News> {
    const news = await this.findOne(id);
    Object.assign(news, dto);
    return this.repository.save(news);
  }

  async remove(id: number): Promise<void> {
    const news = await this.findOne(id);
    await this.repository.remove(news);
  }
}
