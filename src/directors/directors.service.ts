import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Director } from './entities/director.entity';
import { CreateDirectorDto, UpdateDirectorDto } from './dto/director.dto';

@Injectable()
export class DirectorsService {
  constructor(
    @InjectRepository(Director)
    private repository: Repository<Director>,
  ) {}

  async findAll(): Promise<Director[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Director> {
    const director = await this.repository.findOne({ where: { director_id: id } });
    if (!director) {
      throw new NotFoundException(`Director with ID ${id} not found`);
    }
    return director;
  }

  async create(dto: CreateDirectorDto): Promise<Director> {
    const director = this.repository.create(dto);
    return this.repository.save(director);
  }

  async update(id: number, dto: UpdateDirectorDto): Promise<Director> {
    const director = await this.findOne(id);
    Object.assign(director, dto);
    return this.repository.save(director);
  }

  async remove(id: number): Promise<void> {
    const director = await this.findOne(id);
    await this.repository.remove(director);
  }
}
