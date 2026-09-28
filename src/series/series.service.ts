import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Series } from './entities/series.entity';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/series.dto';
import { User } from '../users/entities/user.entity';

const parseBool = (val: any): boolean => {
  if (val === true || val === false) return val;
  if (val === 1 || val === '1' || val === 'true') return true;
  if (val === 0 || val === '0' || val === 'false') return false;
  return false;
};

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private repository: Repository<Series>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async isKidsModeActive(userId?: number): Promise<boolean> {
    if (!userId) return false;
    const user = await this.userRepository.findOne({ where: { userId } });
    return user ? !!user.is_kids_mode : false;
  }

  async findAll(limit?: number, userId?: number): Promise<Series[]> {
    let seriesList = await this.repository.find(limit ? { take: limit } : {});
    const isKidsMode = await this.isKidsModeActive(userId);
    if (isKidsMode) {
      seriesList = seriesList.filter(s => !parseBool(s.kids_restriction));
    }
    return seriesList;
  }

  async findOne(id: number, userId?: number): Promise<Series> {
    const series = await this.repository.findOne({ where: { series_id: id } });
    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }
    const isKidsMode = await this.isKidsModeActive(userId);
    if (isKidsMode && parseBool(series.kids_restriction)) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }
    return series;
  }

  async create(dto: CreateSeriesDto): Promise<Series> {
    const data: any = { ...dto };
    if (data.kids_restriction !== undefined) data.kids_restriction = parseBool(data.kids_restriction);
    const series = this.repository.create(data as CreateSeriesDto);
    return this.repository.save(series);
  }

  async update(id: number, dto: UpdateSeriesDto): Promise<Series> {
    const series = await this.findOne(id);
    const data: any = { ...dto };
    if (data.kids_restriction !== undefined) data.kids_restriction = parseBool(data.kids_restriction);
    Object.assign(series, data);
    return this.repository.save(series);
  }

  async remove(id: number): Promise<void> {
    const series = await this.findOne(id);
    await this.repository.remove(series);
  }
}
