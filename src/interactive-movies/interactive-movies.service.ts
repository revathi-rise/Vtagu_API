import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InteractiveMovie } from './entities/interactive-movie.entity';
import { Scene } from '../scenes/entities/scene.entity';
import { Choice } from '../choices/entities/choice.entity';
import { CreateInteractiveMovieDto, UpdateInteractiveMovieDto } from './dto/interactive-movie.dto';
import { UserInteractiveMoviePurchase } from './entities/user-purchase.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

@Injectable()
export class InteractiveMoviesService {
  constructor(
    @InjectRepository(InteractiveMovie)
    private moviesRepository: Repository<InteractiveMovie>,
    @InjectRepository(Scene)
    private scenesRepository: Repository<Scene>,
    @InjectRepository(Choice)
    private choicesRepository: Repository<Choice>,
    @InjectRepository(UserInteractiveMoviePurchase)
    private purchaseRepository: Repository<UserInteractiveMoviePurchase>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
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

  async checkMovieAccess(movieId: number, userId?: number): Promise<{
    hasAccess: boolean;
    reason: 'free' | 'subscription' | 'single_purchase' | 'none';
    price: number;
    currency: string;
  }> {
    const movie = await this.moviesRepository.findOne({
      where: { interactive_movie_id: movieId },
    });
    if (!movie) {
      throw new NotFoundException(`Interactive movie with ID ${movieId} not found`);
    }

    // 1. If movie is free, allow access
    if (movie.is_free === 1) {
      return {
        hasAccess: true,
        reason: 'free',
        price: 0,
        currency: movie.currency,
      };
    }

    // If no user is logged in, they can't access paid interactive movies
    if (!userId) {
      return {
        hasAccess: false,
        reason: 'none',
        price: movie.price,
        currency: movie.currency,
      };
    }

    // 2. Check if the user has an active subscription that includes interactive movies
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const activeSubs = await this.subscriptionRepository.find({
      where: { userId, status: 1 },
    });
    for (const activeSub of activeSubs) {
      const isPaymentSuccess = Number(activeSub.payment_status) === 2 || Number(activeSub.payment_status) === 1 || activeSub.payment_method === 'FREE';
      const isDateValid = Number(activeSub.timestamp_from) <= currentTimestamp && Number(activeSub.timestamp_to) >= currentTimestamp;

      if (isPaymentSuccess && isDateValid) {
        const plan = await this.planRepository.findOne({
          where: { planId: activeSub.planId },
        });
        if (plan && (Number(plan.isInteractiveIncluded) === 1 || Number((plan as any).is_interactive_included) === 1)) {
          return {
            hasAccess: true,
            reason: 'subscription',
            price: movie.price,
            currency: movie.currency,
          };
        }
      }
    }

    // 3. Check if the user has purchased this movie individually
    const singlePurchase = await this.purchaseRepository.findOne({
      where: { userId, interactiveMovieId: movieId, status: 1 },
    });
    if (singlePurchase) {
      return {
        hasAccess: true,
        reason: 'single_purchase',
        price: movie.price,
        currency: movie.currency,
      };
    }

    // 4. Default: No access
    return {
      hasAccess: false,
      reason: 'none',
      price: movie.price,
      currency: movie.currency,
    };
  }

  async purchaseMovie(
    movieId: number,
    userId: number,
    txnId: string,
    paidAmount: number,
    currency: string,
  ): Promise<UserInteractiveMoviePurchase> {
    const movie = await this.moviesRepository.findOne({
      where: { interactive_movie_id: movieId },
    });
    if (!movie) {
      throw new NotFoundException(`Interactive movie with ID ${movieId} not found`);
    }

    const purchase = this.purchaseRepository.create({
      userId,
      interactiveMovieId: movieId,
      txnId,
      paidAmount,
      currency,
      status: 1, // Active
    });

    return this.purchaseRepository.save(purchase);
  }
}

