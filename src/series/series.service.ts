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

  async isKidsModeActive(
    userId?: number,
    authHeader?: string,
    kidsQueryFlag?: boolean | string,
    kidsHeaderFlag?: boolean | string,
  ): Promise<boolean> {
    if (authHeader && typeof authHeader === 'string') {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const user = await this.userRepository.findOne({ where: { user_session: token } });
        if (user && parseBool(user.is_kids_mode)) return true;
      }
    }
    if (userId) {
      const user = await this.userRepository.findOne({ where: { userId } });
      if (user && parseBool(user.is_kids_mode)) return true;
    }
    if (kidsQueryFlag !== undefined && parseBool(kidsQueryFlag)) return true;
    if (kidsHeaderFlag !== undefined && parseBool(kidsHeaderFlag)) return true;
    return false;
  }

  async findAll(
    limit?: number,
    userId?: number,
    authHeader?: string,
    kidsQueryFlag?: boolean | string,
    kidsHeaderFlag?: boolean | string,
  ): Promise<Series[]> {
    let seriesList = await this.repository.find({ ...(limit ? { take: limit } : {}), relations: ['certificate'] });
    const isKidsMode = await this.isKidsModeActive(userId, authHeader, kidsQueryFlag, kidsHeaderFlag);
    if (isKidsMode) {
      seriesList = seriesList.filter(s => parseBool(s.kids_restriction));
    }
    return seriesList;
  }

  async findOne(
    id: number,
    userId?: number,
    authHeader?: string,
    kidsQueryFlag?: boolean | string,
    kidsHeaderFlag?: boolean | string,
  ): Promise<Series> {
    const series = await this.repository.findOne({ where: { series_id: id }, relations: ['certificate'] });
    if (!series) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }
    const isKidsMode = await this.isKidsModeActive(userId, authHeader, kidsQueryFlag, kidsHeaderFlag);
    if (isKidsMode && !parseBool(series.kids_restriction)) {
      throw new NotFoundException(`Series with ID ${id} not found`);
    }
    return series;
  }

  async create(dto: CreateSeriesDto): Promise<Series> {
    const data: any = { ...dto };
    if (data.kids_restriction !== undefined) data.kids_restriction = parseBool(data.kids_restriction);
    if (data.certificate_id !== undefined || data.certificateId !== undefined) {
      const cId = data.certificate_id ?? data.certificateId;
      data.certificate_id = cId ? Number(cId) : null;
      delete data.certificateId;
    }
    const series = this.repository.create(data as CreateSeriesDto);
    const saved = await this.repository.save(series);
    return this.findOne(saved.series_id);
  }

  async update(id: number, dto: UpdateSeriesDto): Promise<Series> {
    const series = await this.findOne(id);
    const data: any = { ...dto };
    if (data.kids_restriction !== undefined) data.kids_restriction = parseBool(data.kids_restriction);
    if (data.certificate_id !== undefined || data.certificateId !== undefined) {
      const cId = data.certificate_id ?? data.certificateId;
      data.certificate_id = cId ? Number(cId) : null;
      delete data.certificateId;
    }
    Object.assign(series, data);
    await this.repository.save(series);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const series = await this.findOne(id);
    await this.repository.remove(series);
  }
}
