import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scene } from './entities/scene.entity';
import { Choice } from '../choices/entities/choice.entity';
import { CreateSceneDto, UpdateSceneDto } from './dto/scene.dto';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';
import { UserInteractiveMoviePurchase } from '../interactive-movies/entities/user-purchase.entity';
import { User } from '../users/entities/user.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

const parseBoolToNum = (val: any): number => val === true || val === 'true' || val === 1 || val === '1' ? 1 : 0;

@Injectable()
export class ScenesService {
  constructor(
    @InjectRepository(Scene)
    private scenesRepository: Repository<Scene>,
    @InjectRepository(Choice)
    private choicesRepository: Repository<Choice>,
    @InjectRepository(InteractiveMovie)
    private moviesRepository: Repository<InteractiveMovie>,
    @InjectRepository(UserInteractiveMoviePurchase)
    private purchaseRepository: Repository<UserInteractiveMoviePurchase>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  async getUserBySessionToken(token: string): Promise<User | null> {
    if (!token) return null;
    return this.userRepository.findOne({ where: { user_session: token } });
  }

  async getUserById(userId: number): Promise<User | null> {
    if (!userId) return null;
    return this.userRepository.findOne({ where: { userId } });
  }

  /**
   * Check if a user has full access to all scenes of an interactive movie.
   * Returns true if the movie is free, or user has a subscription/purchase, or user is admin.
   */
  private async checkFullAccess(movieId: number, userId?: number): Promise<boolean> {
    // 1. Check if movie is free or has 0 price
    const movie = await this.moviesRepository.findOne({
      where: { interactive_movie_id: movieId },
    });
    if (!movie) return false;

    if (
      Number(movie.is_free) === 1 ||
      Boolean(movie.is_free) === true ||
      String(movie.is_free) === '1' ||
      Number(movie.price) === 0 ||
      movie.price === 0
    ) {
      return true;
    }

    if (!userId) return false;

    // 2. Check user permissions / subscription access
    const user = await this.userRepository.findOne({ where: { userId: userId } });
    if (user) {
      // Admins (type 1 or 2) have full bypass access
      if (String(user.type) === '1' || String(user.type) === '2') {
        return true;
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const activeSub = await this.subscriptionRepository.findOne({
        where: { userId, status: 1 },
        relations: ['plan'],
        order: { subscriptionId: 'DESC' },
      });

      if (activeSub) {
        const fromSec = Number(activeSub.timestamp_from) || 0;
        const toSec = Number(activeSub.timestamp_to) || 0;

        if (toSec > 0 && toSec < currentTimestamp) {
          activeSub.status = 0;
          await this.subscriptionRepository.save(activeSub);
          if (Number(user.interactive_access) !== 0 || Number(user.standard_access) !== 0) {
            user.interactive_access = 0;
            user.standard_access = 0;
            await this.userRepository.save(user);
          }
        } else {
          const isPaid =
            Number(activeSub.payment_status) === 2 ||
            String(activeSub.payment_method).toUpperCase() === 'FREE';
          const isValidDate = (fromSec === 0 || fromSec <= currentTimestamp) && (toSec === 0 || toSec >= currentTimestamp);

          if (isPaid && isValidDate) {
            return true;
          }
        }
      }
    }

    // 3. Check single purchase
    const singlePurchase = await this.purchaseRepository.findOne({
      where: { userId, interactiveMovieId: movieId, status: 1 },
    });
    if (singlePurchase) {
      return true;
    }

    return false;
  }

  async findByMovieId(movieId: number, userId?: number, isAdmin: boolean = false): Promise<any[]> {
    const scenes = await this.scenesRepository.find({
      where: { movie_id: movieId },
      relations: ['choices', 'choices.targetScene'],
      order: {
        scene_id: 'ASC',
      },
    });

    // Determine if user has full access to all scenes
    const hasFullAccess = userId ? await this.checkFullAccess(movieId, userId) : await this.checkFullAccess(movieId);

    // Transform to match PHP logic if needed, although ORM relations are cleaner
    return scenes.map((scene) => {
      const sceneIsFree =
        Number(scene.is_free) === 1 ||
        String(scene.is_free) === '1' ||
        String(scene.is_free).toLowerCase() === 'true' ||
        (scene.is_free as any) === true;
      const canAccessScene = isAdmin || hasFullAccess || sceneIsFree;

      return {
        scene_id: scene.scene_id,
        movie_id: scene.movie_id,
        scene_text: scene.scene_name,
        poster_url: canAccessScene ? scene.scene_url : '',
        scene_url: canAccessScene ? scene.scene_url : '',
        is_ending: Boolean(scene.is_ending),
        end_text: scene.end_text || null,
        show_choices_on: scene.show_choices_on,
        subtitles: canAccessScene ? (scene.subtitles || []) : [],
        is_free: sceneIsFree,
        is_locked: !canAccessScene,
        choices: scene.choices.map((choice) => ({
          choice_id: choice.choice_id,
          choice_text: choice.button_text,
          button_text: choice.button_text,
          next_scene_id: choice.target_scene,
          target_scene: choice.target_scene,
          button_color: choice.button_color,
        })),
      };
    });
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
      end_text: scene.end_text || null,
      show_choices_on: scene.show_choices_on,
      subtitles: scene.subtitles || [],
      is_free: Number(scene.is_free) === 1,
      choices: scene.choices.map((choice) => ({
        choice_id: choice.choice_id,
        choice_text: choice.button_text,
        button_text: choice.button_text,
        next_scene_id: choice.target_scene,
        target_scene: choice.target_scene,
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
      end_text: dto.end_text,
      show_choices_on: dto.show_choices_on,
      subtitles: dto.subtitles,
      is_free: dto.is_free !== undefined ? parseBoolToNum(dto.is_free) : 0,
    });
    const saved = await this.scenesRepository.save(scene);
    return this.findOne(saved.scene_id);
  }

  async update(id: number, dto: UpdateSceneDto): Promise<any> {
    const updateData: any = {
      ...(dto.scene_name !== undefined && { scene_name: dto.scene_name }),
      ...(dto.scene_url !== undefined && { scene_url: dto.scene_url }),
      ...(dto.is_ending !== undefined && { is_ending: dto.is_ending }),
      ...(dto.end_text !== undefined && { end_text: dto.end_text }),
      ...(dto.show_choices_on !== undefined && { show_choices_on: dto.show_choices_on }),
      ...(dto.subtitles !== undefined && { subtitles: dto.subtitles }),
      ...(dto.is_free !== undefined && { is_free: parseBoolToNum(dto.is_free) }),
    };
    await this.scenesRepository.update(id, updateData);
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

  /**
   * Get count of free scenes for a given movie.
   */
  async getFreeSceneCount(movieId: number): Promise<{ freeSceneCount: number; totalSceneCount: number }> {
    const scenes = await this.scenesRepository.find({
      where: { movie_id: movieId },
    });
    const freeCount = scenes.filter(
      (s) =>
        Number(s.is_free) === 1 ||
        String(s.is_free) === '1' ||
        String(s.is_free).toLowerCase() === 'true' ||
        (s.is_free as any) === true,
    ).length;
    return {
      freeSceneCount: freeCount,
      totalSceneCount: scenes.length,
    };
  }
}
