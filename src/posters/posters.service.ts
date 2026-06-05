import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poster } from './poster.entity';
import { CreatePosterDto, UpdatePosterDto } from './dto/poster.dto';

@Injectable()
export class PostersService {
  constructor(
    @InjectRepository(Poster)
    private postersRepo: Repository<Poster>,
  ) { }

  async findAll(limit?: number, pageType?: string, language?: string): Promise<Poster[]> {
    const query = this.postersRepo.createQueryBuilder('posters')
      .where('1=1');

    if (pageType) {
      query.andWhere('posters.page_type = :pageType', { pageType });
    }

    if (language) {
      query.andWhere('posters.languages LIKE :language', { language: `%${language}%` });
    }

    query.orderBy('posters.poster_id', 'DESC');

    if (limit) {
      query.take(limit);
    }

    return query.getMany();
  }

  async findByPageType(pageType: string, language?: string): Promise<Poster[]> {
    const query = this.postersRepo.createQueryBuilder('posters')
      .where('posters.page_type = :pageType', { pageType })
      .andWhere('posters.status = :status', { status: 'A' });

    if (language) {
      query.andWhere('posters.languages LIKE :language', { language: `%${language}%` });
    }

    query.orderBy('posters.poster_id', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<Poster> {
    const poster = await this.postersRepo.findOne({ where: { poster_id: id } });
    if (!poster) {
      throw new NotFoundException(`Poster with ID ${id} not found`);
    }
    return poster;
  }

  async create(dto: CreatePosterDto): Promise<Poster> {
    if (dto.reference_type === 'none') {
      dto.reference_id = null as any;
    }
    const poster = this.postersRepo.create(dto);
    return this.postersRepo.save(poster);
  }

  async update(id: number, dto: UpdatePosterDto): Promise<Poster> {
    const poster = await this.findOne(id);
    if (dto.reference_type === 'none') {
      dto.reference_id = null as any;
    }
    Object.assign(poster, dto);
    return this.postersRepo.save(poster);
  }

  async remove(id: number): Promise<void> {
    const poster = await this.findOne(id);
    await this.postersRepo.remove(poster);
  }
}
