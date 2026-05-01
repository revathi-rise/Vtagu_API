import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actor } from './entities/actor.entity';
import { CreateActorDto, UpdateActorDto } from './dto/actor.dto';

@Injectable()
export class ActorsService {
  constructor(
    @InjectRepository(Actor)
    private repository: Repository<Actor>,
  ) {}

  async findAll(): Promise<Actor[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Actor> {
    const actor = await this.repository.findOne({ where: { actor_id: id } });
    if (!actor) {
      throw new NotFoundException(`Actor with ID ${id} not found`);
    }
    return actor;
  }

  async create(dto: CreateActorDto): Promise<Actor> {
    const actor = this.repository.create(dto);
    return this.repository.save(actor);
  }

  async update(id: number, dto: UpdateActorDto): Promise<Actor> {
    const actor = await this.findOne(id);
    Object.assign(actor, dto);
    return this.repository.save(actor);
  }

  async remove(id: number): Promise<void> {
    const actor = await this.findOne(id);
    await this.repository.remove(actor);
  }
}
