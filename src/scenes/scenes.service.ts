import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scene } from './entities/scene.entity';
import { Choice } from '../choices/entities/choice.entity';
import { CreateSceneDto, UpdateSceneDto } from './dto/scene.dto';

@Injectable()
export class ScenesService {
  constructor(
    @InjectRepository(Scene)
    private scenesRepository: Repository<Scene>,
    @InjectRepository(Choice)
    private choicesRepository: Repository<Choice>,
  ) {}

  async findByMovieId(movieId: number): Promise<any[]> {
    const scenes = await this.scenesRepository.find({
      where: { movie_id: movieId },
      relations: ['choices', 'choices.targetScene'],
      order: {
        scene_id: 'ASC',
      },
    });

    // Transform to match PHP logic if needed, although ORM relations are cleaner
    return scenes.map((scene) => ({
      scene_id: scene.scene_id,
      movie_id: scene.movie_id,
      scene_text: scene.scene_name,
      poster_url: scene.scene_url,
      is_ending: Boolean(scene.is_ending),
      show_choices_on: scene.show_choices_on,
      choices: scene.choices.map((choice) => ({
        choice_id: choice.choice_id,
        choice_text: choice.button_text,
        next_scene_id: choice.target_scene,
        button_color: choice.button_color,
      })),
    }));
  }

  async findOne(id: number): Promise<any> {
    const scene = await this.scenesRepository.findOne({
      where: { scene_id: id },
      relations: ['choices'],
    });
    if (!scene) {
      throw new NotFoundException(`Scene with ID ${id} not found`);
    }
    return {
      scene_id: scene.scene_id,
      movie_id: scene.movie_id,
      scene_text: scene.scene_name,
      poster_url: scene.scene_url,
      is_ending: Boolean(scene.is_ending),
      show_choices_on: scene.show_choices_on,
      choices: scene.choices.map((choice) => ({
        choice_id: choice.choice_id,
        choice_text: choice.button_text,
        next_scene_id: choice.target_scene,
        button_color: choice.button_color,
      })),
    };
  }

  async create(dto: CreateSceneDto): Promise<any> {
    const scene = this.scenesRepository.create({
      movie_id: dto.movie_id,
      scene_name: dto.scene_name,
      scene_url: dto.scene_url,
      is_ending: dto.is_ending,
      show_choices_on: dto.show_choices_on,
    });
    const saved = await this.scenesRepository.save(scene);
    return this.findOne(saved.scene_id);
  }

  async update(id: number, dto: UpdateSceneDto): Promise<any> {
    await this.scenesRepository.update(id, {
      ...(dto.scene_name !== undefined && { scene_name: dto.scene_name }),
      ...(dto.scene_url !== undefined && { scene_url: dto.scene_url }),
      ...(dto.is_ending !== undefined && { is_ending: dto.is_ending }),
      ...(dto.show_choices_on !== undefined && { show_choices_on: dto.show_choices_on }),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Delete choices in the scene first to avoid foreign key constraints
    await this.choicesRepository.delete({ scene_id: id });
    // Set target_scene reference to null for choices pointing to this scene
    await this.choicesRepository.update({ target_scene: id }, { target_scene: null });

    const result = await this.scenesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Scene with ID ${id} not found`);
    }
  }
}
