import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Short } from './short.entity';
import { CreateShortDto, ShortResponseDto, UpdateShortDto } from './shorts.dto';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

@Injectable()
export class ShortsService {
  constructor(
    @InjectRepository(Short)
    private shortsRepo: Repository<Short>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  async checkShortsAccess(userId?: number): Promise<boolean> {
    if (!userId) return false;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const activeSubs = await this.subscriptionRepository.find({
      where: { userId, status: 1 },
    });

    for (const activeSub of activeSubs) {
      const isPaid = Number(activeSub.payment_status) === 2 || activeSub.payment_method === 'FREE';
      const isValidDate = Number(activeSub.timestamp_from) <= currentTimestamp && Number(activeSub.timestamp_to) >= currentTimestamp;

      if (isPaid && isValidDate) {
        const plan = await this.planRepository.findOne({ where: { planId: activeSub.planId } });
        if (plan && (plan.isShortsIncluded === undefined || Number(plan.isShortsIncluded) === 1)) {
          return true;
        }
      }
    }
    return false;
  }

  async findAll(userId?: number): Promise<ShortResponseDto[]> {
    const shorts = await this.shortsRepo.find({
      order: { sort_order: 'ASC', short_id: 'DESC' },
    });
    const hasAccess = userId ? await this.checkShortsAccess(userId) : false;
    return shorts.map((s) => {
      const res = this.mapToResponse(s);
      if (!s.is_free && !hasAccess) {
        res.video_url = "";
      }
      return res;
    });
  }

  async findActive(limit?: number, userId?: number): Promise<ShortResponseDto[]> {
    const query = this.shortsRepo.createQueryBuilder('short')
      .where('short.is_active = :active', { active: true })
      .orderBy('short.sort_order', 'ASC')
      .addOrderBy('short.short_id', 'DESC');

    if (limit) {
      query.take(limit);
    }

    const shorts = await query.getMany();
    const hasAccess = userId ? await this.checkShortsAccess(userId) : false;
    return shorts.map((s) => {
      const res = this.mapToResponse(s);
      if (!s.is_free && !hasAccess) {
        res.video_url = "";
      }
      return res;
    });
  }

  async findOne(id: number, userId?: number): Promise<ShortResponseDto> {
    const short = await this.shortsRepo.findOne({ where: { short_id: id } });
    if (!short) throw new NotFoundException('Short not found');
    const hasAccess = short.is_free || (userId ? await this.checkShortsAccess(userId) : false);
    const res = this.mapToResponse(short);
    if (!hasAccess) {
      res.video_url = "";
    }
    return res;
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
