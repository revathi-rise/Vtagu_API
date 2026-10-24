import { Injectable, NotFoundException, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Poster } from './poster.entity';
import { Movie } from '../movies/movie.entity';
import { Series } from '../series/entities/series.entity';
import { Episode } from '../episodes/episode.entity';
import { User } from '../users/entities/user.entity';
import { CreatePosterDto, UpdatePosterDto } from './dto/poster.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

const parseBool = (val: any): boolean => {
  if (val === true || val === false) return val;
  if (val === 1 || val === '1' || val === 'true') return true;
  if (val === 0 || val === '0' || val === 'false') return false;
  return false;
};

@Injectable()
export class PostersService {
  constructor(
    @InjectRepository(Poster)
    private postersRepo: Repository<Poster>,
    @InjectRepository(Movie)
    private moviesRepo: Repository<Movie>,
    @InjectRepository(Series)
    private seriesRepo: Repository<Series>,
    @InjectRepository(Episode)
    private episodesRepo: Repository<Episode>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @Optional()
    private auditLogsService?: AuditLogsService,
  ) { }

  async isKidsModeActive(
    userId?: number,
    authHeader?: string,
    kidsQueryFlag?: boolean | string,
    kidsHeaderFlag?: boolean | string,
  ): Promise<boolean> {
    if (authHeader && typeof authHeader === 'string') {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const user = await this.userRepo.findOne({ where: { user_session: token } });
        if (user && parseBool(user.is_kids_mode)) return true;
      }
    }
    if (userId) {
      const user = await this.userRepo.findOne({ where: { userId } });
      if (user && parseBool(user.is_kids_mode)) return true;
    }
    if (kidsQueryFlag !== undefined && parseBool(kidsQueryFlag)) return true;
    if (kidsHeaderFlag !== undefined && parseBool(kidsHeaderFlag)) return true;
    return false;
  }

  async checkIsAdmin(authHeader?: string, originHeader?: string): Promise<boolean> {
    if (originHeader && typeof originHeader === 'string' && originHeader.toLowerCase().includes('admin')) {
      return true;
    }
    if (authHeader && typeof authHeader === 'string') {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const user = await this.userRepo.findOne({ where: { user_session: token } });
        if (user && (String(user.type) === '1' || String(user.type) === '2')) {
          return true;
        }
      }
    }
    return false;
  }

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
      kids_restriction: parseBool(poster.kids_restriction),
      kidsRestriction: parseBool(poster.kids_restriction),
      kids_only: parseBool(poster.kids_only),
      kidsOnly: parseBool(poster.kids_only),
      certificate_id: poster.certificate_id || (poster.certificate ? poster.certificate.id : null),
      certificateId: poster.certificate_id || (poster.certificate ? poster.certificate.id : null),
      certificate: poster.certificate ? {
        id: poster.certificate.id,
        code: poster.certificate.code,
        name: poster.certificate.name,
        certification_system: poster.certificate.certification_system,
        maturity_level: poster.certificate.maturity_level,
        badge_color: poster.certificate.badge_color,
      } : null,
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

    if (dto.kids_restriction !== undefined || dto.kidsRestriction !== undefined) {
      const kVal = dto.kids_restriction ?? dto.kidsRestriction;
      data.kids_restriction = parseBool(kVal);
    }

    if (dto.kids_only !== undefined || dto.kidsOnly !== undefined) {
      const kOnly = dto.kids_only ?? dto.kidsOnly;
      data.kids_only = parseBool(kOnly);
    }

    const certIdInput = dto.certificate_id ?? dto.certificateId;
    if (certIdInput !== undefined) {
      if (certIdInput === '' || certIdInput === null || certIdInput === 'none' || certIdInput === 0) {
        data.certificate_id = null as any;
      } else {
        const parsed = parseInt(String(certIdInput), 10);
        data.certificate_id = isNaN(parsed) ? (null as any) : parsed;
      }
    }

    return data;
  }

  private async filterPostersForKids(posters: Poster[]): Promise<Poster[]> {
    const approvedPosters: Poster[] = [];
    for (const poster of posters) {
      if (parseBool(poster.kids_restriction) || parseBool(poster.kids_only) || poster.page_type === 'kids') {
        approvedPosters.push(poster);
        continue;
      }
      const refType = (poster.reference_type || '').toLowerCase();
      const refId = poster.reference_id;
      if (!refId) {
        continue;
      }
      if (refType === 'movie') {
        const movie = await this.moviesRepo.findOne({ where: { movie_id: refId } });
        if (movie && parseBool(movie.kids_restriction)) {
          approvedPosters.push(poster);
        }
      } else if (refType === 'series') {
        const series = await this.seriesRepo.findOne({ where: { series_id: refId } });
        if (series && parseBool(series.kids_restriction)) {
          approvedPosters.push(poster);
        }
      } else if (refType === 'episode') {
        const episode = await this.episodesRepo.findOne({ where: { episode_id: refId } });
        if (episode && parseBool(episode.kids_restriction)) {
          approvedPosters.push(poster);
        }
      }
    }
    return approvedPosters;
  }

  private async enrichPostersWithCertificates(items: Poster[]): Promise<void> {
    const movieRefIds = items
      .filter(p => !p.certificate && (p.reference_type || '').toLowerCase() === 'movie' && p.reference_id)
      .map(p => Number(p.reference_id))
      .filter(id => !isNaN(id) && id > 0);

    if (movieRefIds.length > 0) {
      const refMovies = await this.moviesRepo.find({
        where: { movie_id: In(movieRefIds) },
        relations: ['certificate'],
      });
      const movieMap = new Map(refMovies.map(m => [m.movie_id, m]));
      for (const p of items) {
        if (!p.certificate && (p.reference_type || '').toLowerCase() === 'movie' && p.reference_id) {
          const m = movieMap.get(Number(p.reference_id));
          if (m && m.certificate) {
            p.certificate = m.certificate;
            p.certificate_id = m.certificate.id;
          }
        }
      }
    }
  }

  async findAll(limit?: number, pageType?: string, language?: string, isKidsMode: boolean = false, isAdmin: boolean = false): Promise<any[]> {
    const query = this.postersRepo.createQueryBuilder('posters')
      .leftJoinAndSelect('posters.certificate', 'certificate')
      .where('1=1');

    if (pageType) {
      if (!isAdmin && pageType === 'home' && !isKidsMode) {
        query.andWhere(
          '(posters.page_type = :pageType OR (posters.page_type = :kidsType AND (posters.kids_only = 0 OR posters.kids_only IS NULL)))',
          { pageType: 'home', kidsType: 'kids' }
        );
      } else if (!isAdmin && pageType === 'kids' && isKidsMode) {
        query.andWhere(
          '(posters.page_type = :pageType OR (posters.page_type = :homeType AND (posters.kids_restriction = 1 OR posters.kids_only = 1)))',
          { pageType: 'kids', homeType: 'home' }
        );
      } else {
        query.andWhere('posters.page_type = :pageType', { pageType });
      }
    }

    if (language) {
      query.andWhere('posters.languages LIKE :language', { language: `%${language}%` });
    }

    query.orderBy('posters.poster_id', 'DESC');

    if (limit && !isKidsMode) {
      query.take(limit);
    }

    let items = await query.getMany();
    await this.enrichPostersWithCertificates(items);
    if (isAdmin || !pageType) {
      return items.map((item) => this.mapToResponse(item));
    }
    if (isKidsMode) {
      items = await this.filterPostersForKids(items);
      if (limit) items = items.slice(0, limit);
    } else {
      if (pageType === 'kids') {
        return items.map((item) => this.mapToResponse(item));
      }
      items = items.filter(item => !parseBool(item.kids_only));
    }
    return items.map((item) => this.mapToResponse(item));
  }

  async findByPageType(pageType: string, language?: string, isKidsMode: boolean = false, isAdmin: boolean = false): Promise<any[]> {
    const query = this.postersRepo.createQueryBuilder('posters')
      .leftJoinAndSelect('posters.certificate', 'certificate')
      .andWhere('posters.status = :status', { status: 'A' });

    if (!isAdmin && pageType === 'home' && !isKidsMode) {
      query.andWhere(
        '(posters.page_type = :pageType OR (posters.page_type = :kidsType AND (posters.kids_only = 0 OR posters.kids_only IS NULL)))',
        { pageType: 'home', kidsType: 'kids' }
      );
    } else if (!isAdmin && pageType === 'kids' && isKidsMode) {
      query.andWhere(
        '(posters.page_type = :pageType OR (posters.page_type = :homeType AND (posters.kids_restriction = 1 OR posters.kids_only = 1)))',
        { pageType: 'kids', homeType: 'home' }
      );
    } else {
      query.andWhere('posters.page_type = :pageType', { pageType });
    }

    if (language) {
      query.andWhere('posters.languages LIKE :language', { language: `%${language}%` });
    }

    query.orderBy('posters.poster_id', 'DESC');
    let items = await query.getMany();
    await this.enrichPostersWithCertificates(items);
    if (isAdmin) {
      return items.map((item) => this.mapToResponse(item));
    }
    if (isKidsMode) {
      items = await this.filterPostersForKids(items);
    } else {
      if (pageType === 'kids') {
        return items.map((item) => this.mapToResponse(item));
      }
      items = items.filter(item => !parseBool(item.kids_only));
    }
    return items.map((item) => this.mapToResponse(item));
  }

  async findOne(id: number): Promise<any> {
    const poster = await this.postersRepo.findOne({
      where: { poster_id: id },
      relations: ['certificate'],
    });
    if (!poster) {
      throw new NotFoundException(`Poster with ID ${id} not found`);
    }
    await this.enrichPostersWithCertificates([poster]);
    return this.mapToResponse(poster);
  }

  async create(dto: CreatePosterDto): Promise<any> {
    const data = this.mapFromDto(dto);
    if (!data.path) {
      data.path = '';
    }
    const poster = this.postersRepo.create(data);
    const saved = await this.postersRepo.save(poster);

    if (this.auditLogsService) {
      this.auditLogsService.createLog({ action: 'CREATE', module: 'Posters', resourceId: String(saved.poster_id), details: { newData: saved } }).catch(err => console.error('Failed to log audit:', err));
    }

    return this.findOne(saved.poster_id);
  }

  async update(id: number, dto: UpdatePosterDto): Promise<any> {
    const existing = await this.postersRepo.findOne({ where: { poster_id: id } });
    if (!existing) {
      throw new NotFoundException(`Poster with ID ${id} not found`);
    }

    const oldData = { ...existing };
    const data = this.mapFromDto(dto, existing);
    await this.postersRepo.update(id, data);
    const updated = await this.findOne(id);

    if (this.auditLogsService) {
      this.auditLogsService.createLog({ action: 'UPDATE', module: 'Posters', resourceId: String(id), details: { oldData, newData: updated } }).catch(err => console.error('Failed to log audit:', err));
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.postersRepo.findOne({ where: { poster_id: id } });
    if (!existing) {
      throw new NotFoundException(`Poster with ID ${id} not found`);
    }

    if (this.auditLogsService) {
      this.auditLogsService.createLog({ action: 'DELETE', module: 'Posters', resourceId: String(id), details: { oldData: existing } }).catch(err => console.error('Failed to log audit:', err));
    }

    await this.postersRepo.delete(id);
  }
}
