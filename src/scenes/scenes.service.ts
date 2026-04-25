import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scene } from './entities/scene.entity';

@Injectable()
export class ScenesService {
  constructor(
    @InjectRepository(Scene)
    private scenesRepository: Repository<Scene>,
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
      choices: scene.choices.map((choice) => ({
        choice_id: choice.choice_id,
        choice_text: choice.button_text,
        next_scene_id: choice.target_scene,
      })),
    }));
  }
}
