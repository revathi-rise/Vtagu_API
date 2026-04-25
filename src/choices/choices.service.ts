import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Choice } from './entities/choice.entity';
import { CreateChoiceDto, UpdateChoiceDto } from './dto/choice.dto';

@Injectable()
export class ChoicesService {
  constructor(
    @InjectRepository(Choice)
    private choicesRepository: Repository<Choice>,
  ) {}

  async findAll(sceneId?: number): Promise<Choice[]> {
    const query = this.choicesRepository.createQueryBuilder('choice')
      .leftJoinAndSelect('choice.targetScene', 'targetScene')
      .orderBy('choice.choice_id', 'ASC');

    if (sceneId) {
      query.where('choice.scene_id = :sceneId', { sceneId });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Choice> {
    const choice = await this.choicesRepository.findOne({
      where: { choice_id: id },
    });
    if (!choice) {
      throw new NotFoundException(`Choice with ID ${id} not found`);
    }
    return choice;
  }

  async create(createChoiceDto: CreateChoiceDto): Promise<Choice> {
    const choice = this.choicesRepository.create(createChoiceDto);
    const saved = await this.choicesRepository.save(choice);
    return this.findOne(saved.choice_id);
  }

  async update(updateChoiceDto: UpdateChoiceDto): Promise<Choice> {
    const { choice_id, ...updateData } = updateChoiceDto;
    await this.choicesRepository.update(choice_id, updateData);
    return this.findOne(choice_id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.choicesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Choice with ID ${id} not found`);
    }
  }
}
