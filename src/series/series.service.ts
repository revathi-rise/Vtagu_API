import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Series } from './entities/series.entity';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/series.dto';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private repository: Repository<Series>,
  ) {}

  async findAll(): Promise<Series[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Series> {
    const series = await this.repository.findOne({ where: { series_id: id } });
    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }
    return series;
  }

  async create(dto: CreateSeriesDto): Promise<Series> {
    const series = this.repository.create(dto);
    return this.repository.save(series);
  }

  async update(id: number, dto: UpdateSeriesDto): Promise<Series> {
    const series = await this.findOne(id);
    Object.assign(series, dto);
    return this.repository.save(series);
  }

  async remove(id: number): Promise<void> {
    const series = await this.findOne(id);
    await this.repository.remove(series);
  }
}
