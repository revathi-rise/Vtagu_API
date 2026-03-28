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

  findAll(): Promise<Genre[]> {
    return this.repo.find({ where: { in_home: 'Y' }, order: { genre_id: 'ASC' } });
  }

  findForHome(limit = 10): Promise<Genre[]> {
    return this.repo.find({ where: { in_home: 'Y' }, order: { genre_id: 'ASC' }, take: limit });
  }

  create(data: Partial<Genre>) {
    const m = this.repo.create(data as any);
    return this.repo.save(m);
  }
}
