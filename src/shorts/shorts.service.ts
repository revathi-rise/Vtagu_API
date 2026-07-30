import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Short } from './short.entity';
import { CreateShortDto, ShortResponseDto, UpdateShortDto } from './shorts.dto';

@Injectable()
export class ShortsService {
  constructor(
    @InjectRepository(Short)
    private shortsRepo: Repository<Short>,
  ) {}

  async findAll(): Promise<ShortResponseDto[]> {
    const shorts = await this.shortsRepo.find({
      order: { sort_order: 'ASC', short_id: 'DESC' },
    });
    return shorts.map((s) => this.mapToResponse(s));
  }

  async findActive(limit?: number): Promise<ShortResponseDto[]> {
    const query = this.shortsRepo.createQueryBuilder('short')
      .where('short.is_active = :active', { active: true })
      .orderBy('short.sort_order', 'ASC')
      .addOrderBy('short.short_id', 'DESC');

    if (limit) {
      query.take(limit);
    }

    const shorts = await query.getMany();
    return shorts.map((s) => this.mapToResponse(s));
  }

  async findOne(id: number): Promise<ShortResponseDto> {
    const short = await this.shortsRepo.findOne({ where: { short_id: id } });
    if (!short) throw new NotFoundException('Short not found');
    return this.mapToResponse(short);
  }

  async create(dto: CreateShortDto): Promise<ShortResponseDto> {
    const short = this.shortsRepo.create(dto);
    const saved = await this.shortsRepo.save(short);
    return this.mapToResponse(saved);
  }

  async update(id: number, dto: UpdateShortDto): Promise<ShortResponseDto> {
    const short = await this.shortsRepo.findOne({ where: { short_id: id } });
    if (!short) throw new NotFoundException('Short not found');
    Object.assign(short, dto);
    const updated = await this.shortsRepo.save(short);
    return this.mapToResponse(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.shortsRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Short not found');
  }

  async incrementView(id: number): Promise<void> {
    await this.shortsRepo.increment({ short_id: id }, 'view_count', 1);
  }

  private mapToResponse(s: Short): ShortResponseDto {
    return {
      id: s.short_id,
      title: s.title,
      slug: s.slug,
      description: s.description,
      video_url: s.video_url,
      thumbnail_url: s.thumbnail_url,
      duration: s.duration,
      languages: s.languages,
      genre_id: s.genre_id,
      is_free: s.is_free,
      is_featured: s.is_featured,
      is_active: s.is_active,
      view_count: s.view_count,
      sort_order: s.sort_order,
      created_at: s.created_at,
      updated_at: s.updated_at,
    };
  }
}
