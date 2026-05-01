import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private repository: Repository<Faq>,
  ) {}

  async findAll(): Promise<Faq[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Faq> {
    const faq = await this.repository.findOne({ where: { faq_id: id } });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async create(dto: CreateFaqDto): Promise<Faq> {
    const faq = this.repository.create(dto);
    return this.repository.save(faq);
  }

  async update(id: number, dto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findOne(id);
    Object.assign(faq, dto);
    return this.repository.save(faq);
  }

  async remove(id: number): Promise<void> {
    const faq = await this.findOne(id);
    await this.repository.remove(faq);
  }
}
