import { Injectable, NotFoundException, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poster } from './poster.entity';
import { CreatePosterDto, UpdatePosterDto } from './dto/poster.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class PostersService {
  constructor(
    @InjectRepository(Poster)
    private postersRepo: Repository<Poster>,
    @Optional()
    private auditLogsService?: AuditLogsService,
  ) { }

  private mapToResponse(poster: Poster) {
    if (!poster) return null;
    const id = poster.poster_id;
    const title = poster.poster_title || '';
    const path = poster.path || '';
    const pageType = poster.page_type || '';
    const refId = poster.reference_id !== null && poster.reference_id !== undefined ? Number(poster.reference_id) : null;
    const refType = poster.reference_type || '';

    return {
      ...poster,
      id,
      poster_id: id,
      title,
      poster_title: title,
      path,
      url: path,
      image: path,
      poster_image: path,
      page_type: pageType,
      pageType,
      reference_id: refId,
      referenceId: refId,
      reference_type: refType,
      referenceType: refType,
      trailer_url: poster.trailer_url || '',
      trailerUrl: poster.trailer_url || '',
      status: poster.status || 'A',
      is_coming_soon: Boolean(poster.is_coming_soon),
    };
  }

  private mapFromDto(dto: any, existingPoster?: Poster): Partial<Poster> {
    const data: Partial<Poster> = {};

    if (dto.poster_title !== undefined || dto.title !== undefined) {
      data.poster_title = dto.poster_title ?? dto.title;
    }

    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    const genresInput = dto.genres_list ?? dto.genres;
    if (genresInput !== undefined) {
      data.genres_list = Array.isArray(genresInput) ? genresInput.join(',') : String(genresInput);
    }

    const pathInput = dto.path ?? dto.url ?? dto.image ?? dto.poster_image;
    if (pathInput !== undefined) {
      data.path = String(pathInput);
    }

    const trailerInput = dto.trailer_url ?? dto.trailerUrl;
    if (trailerInput !== undefined) {
      data.trailer_url = String(trailerInput);
    }

    if (dto.link !== undefined) {
      data.link = String(dto.link);
    }

    if (dto.languages !== undefined) {
      data.languages = Array.isArray(dto.languages) ? dto.languages.join(',') : String(dto.languages);
    }

    const pageTypeInput = dto.page_type ?? dto.pageType;
    if (pageTypeInput !== undefined) {
      data.page_type = String(pageTypeInput);
    }

    const refTypeInput = dto.reference_type ?? dto.referenceType;
    if (refTypeInput !== undefined) {
      data.reference_type = String(refTypeInput);
    }

    const refIdInput = dto.reference_id ?? dto.referenceId;
    const currentRefType = data.reference_type ?? existingPoster?.reference_type;
    if (currentRefType === 'none') {
      data.reference_id = null as any;
    } else if (refIdInput !== undefined) {
      if (refIdInput === '' || refIdInput === null || refIdInput === 'none') {
        data.reference_id = null as any;
      } else {
        const parsed = parseInt(String(refIdInput), 10);
        data.reference_id = isNaN(parsed) ? (null as any) : parsed;
      }
    }

    if (dto.status !== undefined) {
      if (['A', 'active', '1', 1, true].includes(dto.status)) {
        data.status = 'A';
      } else if (['I', 'inactive', '0', 0, false].includes(dto.status)) {
        data.status = 'I';
      } else {
        data.status = String(dto.status);
      }
    }

    if (dto.is_coming_soon !== undefined) {
      data.is_coming_soon = dto.is_coming_soon === true || dto.is_coming_soon === 'true' || dto.is_coming_soon === 1 || dto.is_coming_soon === '1';
    }

    return data;
  }

  async findAll(limit?: number, pageType?: string, language?: string): Promise<any[]> {
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

    const items = await query.getMany();
    return items.map((item) => this.mapToResponse(item));
  }

  async findByPageType(pageType: string, language?: string): Promise<any[]> {
    const query = this.postersRepo.createQueryBuilder('posters')
      .where('posters.page_type = :pageType', { pageType })
      .andWhere('posters.status = :status', { status: 'A' });

    if (language) {
      query.andWhere('posters.languages LIKE :language', { language: `%${language}%` });
    }

    query.orderBy('posters.poster_id', 'DESC');
    const items = await query.getMany();
    return items.map((item) => this.mapToResponse(item));
  }

  async findOne(id: number): Promise<any> {
    const poster = await this.postersRepo.findOne({ where: { poster_id: id } });
    if (!poster) {
      throw new NotFoundException(`Poster with ID ${id} not found`);
    }
    return this.mapToResponse(poster);
  }

  async create(dto: CreatePosterDto): Promise<any> {
    const data = this.mapFromDto(dto);
    if (!data.path) {
      data.path = '';
    }
    if (!data.status) {
      data.status = 'A';
    }
    const poster = this.postersRepo.create(data);
    const saved = await this.postersRepo.save(poster);

    if (this.auditLogsService) {
      await this.auditLogsService.createLog({
        userId: 1,
        userEmail: 'admin@vtagu.com',
        action: 'CREATE_BANNER',
        module: 'BANNERS',
        resourceId: String(saved.poster_id),
        details: { title: saved.poster_title, page_type: saved.page_type },
      }).catch(() => null);
    }

    return this.mapToResponse(saved);
  }

  async update(id: number, dto: UpdatePosterDto): Promise<any> {
    const poster = await this.postersRepo.findOne({ where: { poster_id: id } });
    if (!poster) {
      throw new NotFoundException(`Poster with ID ${id} not found`);
    }
    const data = this.mapFromDto(dto, poster);
    Object.assign(poster, data);
    const saved = await this.postersRepo.save(poster);

    if (this.auditLogsService) {
      await this.auditLogsService.createLog({
        userId: 1,
        userEmail: 'admin@vtagu.com',
        action: 'UPDATE_BANNER',
        module: 'BANNERS',
        resourceId: String(saved.poster_id),
        details: { title: saved.poster_title, page_type: saved.page_type },
      }).catch(() => null);
    }

    return this.mapToResponse(saved);
  }

  async remove(id: number): Promise<void> {
    const poster = await this.postersRepo.findOne({ where: { poster_id: id } });
    if (!poster) {
      throw new NotFoundException(`Poster with ID ${id} not found`);
    }
    await this.postersRepo.remove(poster);

    if (this.auditLogsService) {
      await this.auditLogsService.createLog({
        userId: 1,
        userEmail: 'admin@vtagu.com',
        action: 'DELETE_BANNER',
        module: 'BANNERS',
        resourceId: String(id),
        details: { title: poster.poster_title },
      }).catch(() => null);
    }
  }
}


