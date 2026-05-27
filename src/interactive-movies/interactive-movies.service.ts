import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InteractiveMovie } from './entities/interactive-movie.entity';
import { Scene } from '../scenes/entities/scene.entity';
import { Choice } from '../choices/entities/choice.entity';
import { CreateInteractiveMovieDto, UpdateInteractiveMovieDto } from './dto/interactive-movie.dto';

@Injectable()
export class InteractiveMoviesService {
  constructor(
    @InjectRepository(InteractiveMovie)
    private moviesRepository: Repository<InteractiveMovie>,
    @InjectRepository(Scene)
    private scenesRepository: Repository<Scene>,
    @InjectRepository(Choice)
    private choicesRepository: Repository<Choice>,
  ) {}

  async findAll(): Promise<InteractiveMovie[]> {
    return this.moviesRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<InteractiveMovie> {
    const movie = await this.moviesRepository.findOne({
      where: { interactive_movie_id: id },
    });
    if (!movie) {
      throw new NotFoundException(`Interactive movie with ID ${id} not found`);
    }
    return movie;
  }

  async create(dto: CreateInteractiveMovieDto): Promise<InteractiveMovie> {
    const movie = this.moviesRepository.create(dto);
    return this.moviesRepository.save(movie);
  }

  async update(id: number, dto: UpdateInteractiveMovieDto): Promise<InteractiveMovie> {
    await this.moviesRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // 1. Find all scenes for this interactive movie
    const scenes = await this.scenesRepository.find({
      where: { movie_id: id },
    });
    const sceneIds = scenes.map((s) => s.scene_id);

    if (sceneIds.length > 0) {
      // 2. Delete choices inside these scenes
      await this.choicesRepository.delete({ scene_id: In(sceneIds) });
      
      // 3. Clear choices target pointers pointing to these scenes
      await this.choicesRepository.update({ target_scene: In(sceneIds) }, { target_scene: null });
      
      // 4. Delete the scenes
      await this.scenesRepository.delete({ movie_id: id });
    }

    // 5. Delete the interactive movie itself
    const result = await this.moviesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Interactive movie with ID ${id} not found`);
    }
  }
}
