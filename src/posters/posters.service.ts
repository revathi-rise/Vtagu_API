import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poster } from './poster.entity';

@Injectable()
export class PostersService {
  constructor(
    @InjectRepository(Poster)
    private postersRepo: Repository<Poster>,
  ) { }

  async findAll(limit?: number): Promise<Poster[]> {
    const query = this.postersRepo.createQueryBuilder('posters')
      .orderBy('posters.poster_id', 'DESC');

    if (limit) {
      query.take(limit);
    }

    return query.getMany();
  }
}
