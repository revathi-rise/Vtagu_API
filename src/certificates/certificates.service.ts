import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { Movie } from '../movies/movie.entity';
import { Episode } from '../episodes/episode.entity';
import { Series } from '../series/entities/series.entity';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { Poster } from '../posters/poster.entity';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

export interface FindCertificatesQuery {
  search?: string;
  system?: string;
  status?: string;
  country?: string;
  all?: string | boolean;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Episode)
    private readonly episodeRepo: Repository<Episode>,
    @InjectRepository(Series)
    private readonly seriesRepo: Repository<Series>,
    @InjectRepository(InteractiveMovie)
    private readonly interactiveMovieRepo: Repository<InteractiveMovie>,
    @InjectRepository(Poster)
    private readonly posterRepo: Repository<Poster>,
  ) {}

  /**
   * List certificates with search, filtering, movie count, and pagination
   */
  async findAll(query: FindCertificatesQuery) {
    const qb = this.certificateRepo
      .createQueryBuilder('c')
      .leftJoin('movie', 'm', 'm.certificate_id = c.id')
      .leftJoin('episode', 'e', 'e.certificate_id = c.id')
      .leftJoin('series', 's', 's.certificate_id = c.id')
      .leftJoin('interactive_movies', 'im', 'im.certificate_id = c.id')
      .leftJoin('posters', 'p', 'p.certificate_id = c.id')
      .select([
        'c.id AS id',
        'c.code AS code',
        'c.name AS name',
        'c.certification_system AS certification_system',
        'c.country AS country',
        'c.description AS description',
        'c.maturity_level AS maturity_level',
        'c.badge_color AS badge_color',
        'c.status AS status',
        'c.created_at AS created_at',
        'c.updated_at AS updated_at',
        'COUNT(DISTINCT m.movie_id) AS movie_count',
        'COUNT(DISTINCT e.episode_id) AS episode_count',
        'COUNT(DISTINCT s.series_id) AS series_count',
        'COUNT(DISTINCT im.interactive_movie_id) AS interactive_count',
        'COUNT(DISTINCT p.poster_id) AS poster_count',
      ])
      .groupBy('c.id');

    if (query.search && query.search.trim()) {
      const term = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(c.code) LIKE :term OR LOWER(c.name) LIKE :term OR LOWER(c.certification_system) LIKE :term OR LOWER(c.country) LIKE :term OR LOWER(c.description) LIKE :term)',
        { term },
      );
    }

    if (query.system && query.system.trim()) {
      qb.andWhere('LOWER(c.certification_system) = LOWER(:system)', { system: query.system.trim() });
    }

    if (query.status && query.status.trim() && query.status !== 'all') {
      qb.andWhere('c.status = :status', { status: query.status.trim() });
    }

    if (query.country && query.country.trim()) {
      qb.andWhere('LOWER(c.country) = LOWER(:country)', { country: query.country.trim() });
    }

    // Default sorting: CBFC entries first, then alphabetical by code
    const isSortByAllowed = query.sortBy && ['id', 'code', 'name', 'certification_system', 'country', 'status', 'created_at'].includes(query.sortBy);
    if (isSortByAllowed) {
      qb.orderBy(`c.${query.sortBy}`, query.sortOrder === 'DESC' ? 'DESC' : 'ASC');
    } else {
      qb.orderBy("CASE WHEN c.certification_system = 'CBFC' THEN 0 ELSE 1 END", 'ASC')
        .addOrderBy('c.code', 'ASC');
    }

    const isAll = query.all === 'true' || query.all === true || query.all === '1';

    if (isAll) {
      const rawItems = await qb.getRawMany();
      return {
        items: rawItems.map(this.formatRawCertificate),
        total: rawItems.length,
        page: 1,
        limit: rawItems.length,
        totalPages: 1,
      };
    }

    const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(String(query.limit || 20), 10) || 20));
    const offset = (page - 1) * limit;

    // Get total count of distinct certificates matching filters
    const countQb = this.certificateRepo.createQueryBuilder('c');
    if (query.search && query.search.trim()) {
      const term = `%${query.search.trim().toLowerCase()}%`;
      countQb.andWhere(
        '(LOWER(c.code) LIKE :term OR LOWER(c.name) LIKE :term OR LOWER(c.certification_system) LIKE :term OR LOWER(c.country) LIKE :term OR LOWER(c.description) LIKE :term)',
        { term },
      );
    }
    if (query.system && query.system.trim()) {
      countQb.andWhere('LOWER(c.certification_system) = LOWER(:system)', { system: query.system.trim() });
    }
    if (query.status && query.status.trim() && query.status !== 'all') {
      countQb.andWhere('c.status = :status', { status: query.status.trim() });
    }
    if (query.country && query.country.trim()) {
      countQb.andWhere('LOWER(c.country) = LOWER(:country)', { country: query.country.trim() });
    }
    const total = await countQb.getCount();

    qb.offset(offset).limit(limit);
    const rawItems = await qb.getRawMany();

    return {
      items: rawItems.map(this.formatRawCertificate),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Fast list of active certificates for movie dropdowns
   */
  async findActive(): Promise<Certificate[]> {
    return this.certificateRepo
      .createQueryBuilder('c')
      .where("c.status = 'active'")
      .orderBy("CASE WHEN c.certification_system = 'CBFC' THEN 0 ELSE 1 END", 'ASC')
      .addOrderBy('c.code', 'ASC')
      .getMany();
  }

  /**
   * Get single certificate by ID along with movie count and recent movies
   */
  async findOne(id: number) {
    const certificate = await this.certificateRepo.findOne({ where: { id } });
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID #${id} not found`);
    }

    const movieCount = await this.movieRepo.count({ where: { certificate_id: id } });
    const recentMovies = await this.movieRepo.find({
      where: { certificate_id: id },
      select: ['movie_id', 'title', 'year', 'movie_image', 'created_at'],
      take: 10,
      order: { movie_id: 'DESC' },
    });

    return {
      ...certificate,
      movie_count: movieCount,
      recent_movies: recentMovies,
    };
  }

  /**
   * Create a new certificate with unique validation
   */
  async create(dto: CreateCertificateDto): Promise<Certificate> {
    const codeNormalized = dto.code.trim();
    const systemNormalized = (dto.certification_system || 'CBFC').trim();

    // Check uniqueness of code within system
    const existing = await this.certificateRepo
      .createQueryBuilder('c')
      .where('LOWER(c.code) = LOWER(:code) AND LOWER(c.certification_system) = LOWER(:system)', {
        code: codeNormalized,
        system: systemNormalized,
      })
      .getOne();

    if (existing) {
      throw new ConflictException(
        `A certificate with code "${codeNormalized}" already exists for certification system "${systemNormalized}".`,
      );
    }

    const cert = this.certificateRepo.create({
      code: codeNormalized,
      name: dto.name.trim(),
      certification_system: systemNormalized,
      country: (dto.country || 'India').trim(),
      description: dto.description?.trim() || null,
      maturity_level: dto.maturity_level?.trim() || null,
      badge_color: dto.badge_color?.trim() || this.getDefaultBadgeColor(codeNormalized),
      status: dto.status === 'inactive' ? 'inactive' : 'active',
    });

    return this.certificateRepo.save(cert);
  }

  /**
   * Update an existing certificate
   */
  async update(id: number, dto: UpdateCertificateDto): Promise<Certificate> {
    const certificate = await this.certificateRepo.findOne({ where: { id } });
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID #${id} not found`);
    }

    const codeNormalized = dto.code !== undefined ? dto.code.trim() : certificate.code;
    const systemNormalized = dto.certification_system !== undefined ? dto.certification_system.trim() : certificate.certification_system;

    // If code or system changed, ensure no collision with another certificate
    if (codeNormalized !== certificate.code || systemNormalized !== certificate.certification_system) {
      const conflict = await this.certificateRepo
        .createQueryBuilder('c')
        .where('c.id != :id AND LOWER(c.code) = LOWER(:code) AND LOWER(c.certification_system) = LOWER(:system)', {
          id,
          code: codeNormalized,
          system: systemNormalized,
        })
        .getOne();

      if (conflict) {
        throw new ConflictException(
          `Another certificate with code "${codeNormalized}" already exists for certification system "${systemNormalized}".`,
        );
      }
    }

    if (dto.code !== undefined) certificate.code = codeNormalized;
    if (dto.name !== undefined) certificate.name = dto.name.trim();
    if (dto.certification_system !== undefined) certificate.certification_system = systemNormalized;
    if (dto.country !== undefined) certificate.country = dto.country.trim();
    if (dto.description !== undefined) certificate.description = dto.description?.trim() || null;
    if (dto.maturity_level !== undefined) certificate.maturity_level = dto.maturity_level?.trim() || null;
    if (dto.badge_color !== undefined) certificate.badge_color = dto.badge_color?.trim() || certificate.badge_color;
    if (dto.status !== undefined) certificate.status = dto.status;

    return this.certificateRepo.save(certificate);
  }

  /**
   * Safe delete: Rejects deletion if referenced by existing movies!
   * Requirement 10: "Prevent deletion of certificates referenced by movies. Offer deactivation or reassignment instead."
   */
  async remove(id: number): Promise<{ message: string; safe_deleted: boolean }> {
    const certificate = await this.certificateRepo.findOne({ where: { id } });
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID #${id} not found`);
    }

    // Check referential integrity across all content modules
    const [movieCount, episodeCount, seriesCount, interactiveCount, posterCount] = await Promise.all([
      this.movieRepo.count({ where: { certificate_id: id } }),
      this.episodeRepo.count({ where: { certificate_id: id } }),
      this.seriesRepo.count({ where: { certificate_id: id } }),
      this.interactiveMovieRepo.count({ where: { certificate_id: id } }),
      this.posterRepo.count({ where: { certificate_id: id } }),
    ]);

    const totalUsage = movieCount + episodeCount + seriesCount + interactiveCount + posterCount;

    if (totalUsage > 0) {
      const breakdown: string[] = [];
      if (movieCount > 0) breakdown.push(`${movieCount} movie(s)`);
      if (seriesCount > 0) breakdown.push(`${seriesCount} web series`);
      if (episodeCount > 0) breakdown.push(`${episodeCount} episode(s)`);
      if (interactiveCount > 0) breakdown.push(`${interactiveCount} interactive movie(s)`);
      if (posterCount > 0) breakdown.push(`${posterCount} banner(s)/poster(s)`);

      throw new BadRequestException({
        statusCode: 400,
        error: 'REFERENCED_BY_CONTENT',
        message: `Cannot delete certificate "${certificate.code}" because it is currently assigned to ${breakdown.join(', ')}. To preserve data integrity, please deactivate this certificate instead so it is hidden from new assignments, or reassign those items first.`,
        movie_count: movieCount,
        episode_count: episodeCount,
        series_count: seriesCount,
        interactive_count: interactiveCount,
        poster_count: posterCount,
        total_usage_count: totalUsage,
        certificate_id: id,
        certificate_code: certificate.code,
      });
    }

    await this.certificateRepo.delete(id);
    return {
      message: `Certificate "${certificate.code}" (${certificate.name}) was successfully deleted.`,
      safe_deleted: true,
    };
  }

  /**
   * Toggle certificate status between active and inactive
   */
  async toggleStatus(id: number): Promise<Certificate> {
    const certificate = await this.certificateRepo.findOne({ where: { id } });
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID #${id} not found`);
    }

    certificate.status = certificate.status === 'active' ? 'inactive' : 'active';
    return this.certificateRepo.save(certificate);
  }

  /**
   * Get distinct certification systems and countries for UI filters
   */
  async getFilterOptions() {
    const systemsRaw = await this.certificateRepo
      .createQueryBuilder('c')
      .select('DISTINCT c.certification_system', 'system')
      .orderBy('system', 'ASC')
      .getRawMany();

    const countriesRaw = await this.certificateRepo
      .createQueryBuilder('c')
      .select('DISTINCT c.country', 'country')
      .orderBy('country', 'ASC')
      .getRawMany();

    return {
      systems: systemsRaw.map((r) => r.system).filter(Boolean),
      countries: countriesRaw.map((r) => r.country).filter(Boolean),
    };
  }

  private formatRawCertificate(row: any) {
    return {
      id: Number(row.id),
      code: row.code,
      name: row.name,
      certification_system: row.certification_system,
      country: row.country,
      description: row.description,
      maturity_level: row.maturity_level,
      badge_color: row.badge_color || '#10B981',
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      movie_count: parseInt(row.movie_count || '0', 10),
      episode_count: parseInt(row.episode_count || '0', 10),
      series_count: parseInt(row.series_count || '0', 10),
      interactive_count: parseInt(row.interactive_count || '0', 10),
      poster_count: parseInt(row.poster_count || '0', 10),
      total_usage_count:
        parseInt(row.movie_count || '0', 10) +
        parseInt(row.episode_count || '0', 10) +
        parseInt(row.series_count || '0', 10) +
        parseInt(row.interactive_count || '0', 10) +
        parseInt(row.poster_count || '0', 10),
    };
  }

  private getDefaultBadgeColor(code: string): string {
    const c = code.toUpperCase().trim();
    if (c === 'U' || c === 'G') return '#10B981'; // Emerald Green
    if (c.includes('7+')) return '#06B6D4'; // Cyan
    if (c.includes('13+') || c === 'PG-13' || c === '12A') return '#F59E0B'; // Amber
    if (c.includes('16+') || c === '15') return '#F97316'; // Orange
    if (c === 'A' || c === 'R' || c === 'NC-17' || c === '18') return '#EF4444'; // Red
    if (c === 'S') return '#8B5CF6'; // Purple
    return '#6366F1'; // Indigo default
  }
}
