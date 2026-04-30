import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private repo: Repository<Genre>,
  ) { }

  async findAll() {
    const genres = await this.repo.find({ order: { genre_id: 'ASC' } });
    return genres.map(g => this.mapToResponse(g));
  }

  async findForHome(limit = 10) {
    const genres = await this.repo.find({ where: { in_home: 'Y' }, order: { genre_id: 'ASC' }, take: limit });
    return genres.map(g => this.mapToResponse(g));
  }

  async create(data: any) {
    const genreData: Partial<Genre> = { ...data };
    if (data.genre_name) genreData.name = data.genre_name;
    const m = this.repo.create(genreData);
    const saved = await this.repo.save(m);
    return this.mapToResponse(saved);
  }

  async update(id: number, data: any) {
    const genreData: Partial<Genre> = { ...data };
    if (data.genre_name) genreData.name = data.genre_name;
    await this.repo.update(id, genreData);
    const updated = await this.repo.findOne({ where: { genre_id: id } });
    return this.mapToResponse(updated);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }

  private mapToResponse(g: Genre | null) {
    if (!g) return null;
    return {
      genre_id: g.genre_id,
      genre_name: g.name,
      in_home: g.in_home,
      path: g.path
    };
  }
}
