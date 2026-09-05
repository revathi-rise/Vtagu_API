import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Short } from './short.entity';
import { CreateShortDto, ShortResponseDto, UpdateShortDto } from './shorts.dto';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

const parseBool = (val: any): boolean => {
  if (val === true || val === false) return val;
  if (val === 1 || val === '1' || val === 'true') return true;
  if (val === 0 || val === '0' || val === 'false') return false;
  return false;
};

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
      const isPaid = Number(activeSub.payment_status) === 2 || Number(activeSub.payment_status) === 1 || activeSub.payment_method === 'FREE';
      const fromSec = Number(activeSub.timestamp_from) || 0;
      const toSec = Number(activeSub.timestamp_to) || 0;
      const isValidDate = (fromSec === 0 || fromSec <= currentTimestamp) && (toSec === 0 || toSec >= currentTimestamp);

      if (isPaid && isValidDate) {
        const plan = await this.planRepository.findOne({ where: { planId: activeSub.planId } });
        if (plan) {
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
      if (!parseBool(s.is_free) && !hasAccess) {
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
      if (!parseBool(s.is_free) && !hasAccess) {
        res.video_url = "";
      }
      return res;
    });
  }

  async findOne(id: number, userId?: number): Promise<ShortResponseDto> {
    const short = await this.shortsRepo.findOne({ where: { short_id: id } });
    if (!short) throw new NotFoundException('Short not found');
    const isFree = parseBool(short.is_free);
    const hasAccess = isFree || (userId ? await this.checkShortsAccess(userId) : false);
    const res = this.mapToResponse(short);
    if (!hasAccess) {
      res.video_url = "";
    }
    return res;
  }

  async create(dto: CreateShortDto): Promise<ShortResponseDto> {
    const shortData = { ...dto };
    if (shortData.is_free !== undefined) shortData.is_free = parseBool(shortData.is_free) as any;
    if (shortData.is_featured !== undefined) shortData.is_featured = parseBool(shortData.is_featured) as any;
    if (shortData.is_active !== undefined) shortData.is_active = parseBool(shortData.is_active) as any;
    const short = this.shortsRepo.create(shortData);
    const saved = await this.shortsRepo.save(short);
    return this.mapToResponse(saved);
  }

  async update(id: number, dto: UpdateShortDto): Promise<ShortResponseDto> {
    const short = await this.shortsRepo.findOne({ where: { short_id: id } });
    if (!short) throw new NotFoundException('Short not found');
    const updateData = { ...dto };
    delete (updateData as any).id;
    delete (updateData as any).short_id;
    delete (updateData as any).createdAt;
    delete (updateData as any).updatedAt;
    delete (updateData as any).created_at;
    delete (updateData as any).updated_at;
    if (updateData.is_free !== undefined) updateData.is_free = parseBool(updateData.is_free) as any;
    if (updateData.is_featured !== undefined) updateData.is_featured = parseBool(updateData.is_featured) as any;
    if (updateData.is_active !== undefined) updateData.is_active = parseBool(updateData.is_active) as any;
    await this.shortsRepo.update({ short_id: id }, updateData);
    const updated = await this.shortsRepo.findOne({ where: { short_id: id } });
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
      is_free: parseBool(s.is_free),
      is_featured: parseBool(s.is_featured),
      is_active: parseBool(s.is_active),
      view_count: s.view_count,
      sort_order: s.sort_order,
      created_at: s.created_at,
      updated_at: s.updated_at,
    };
  }
}
