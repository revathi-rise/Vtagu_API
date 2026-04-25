import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionResponseDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  /**
   * Create a new subscription
   */
  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<{ status: boolean; message: string; data: SubscriptionResponseDto }> {
    try {
      const subscription = this.subscriptionRepository.create(createSubscriptionDto);
      subscription.payment_status = 'pending';
      subscription.status = 'active';
      subscription.created_at = new Date();

      const savedSubscription = await this.subscriptionRepository.save(subscription);
      return {
        status: true,
        message: 'Subscription created successfully',
        data: this.mapToResponse(savedSubscription),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get all subscriptions
   */
  async findAll(): Promise<{ status: boolean; message: string; data: SubscriptionResponseDto[] }> {
    try {
      const subscriptions = await this.subscriptionRepository.find({
        relations: ['user'],
        order: { subscriptionId: 'DESC' },
      });
      return {
        status: true,
        message: 'Subscriptions fetched successfully',
        data: subscriptions.map(s => this.mapToResponse(s)),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get subscription by ID
   */
  async findOne(id: number): Promise<{ status: boolean; message: string; data: SubscriptionResponseDto }> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { subscriptionId: id },
        relations: ['user'],
      });
      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }
      return {
        status: true,
        message: 'Subscription fetched successfully',
        data: this.mapToResponse(subscription),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get active subscription for user
   */
  async getActiveSubscription(userId: number): Promise<{ status: boolean; message: string; data: SubscriptionResponseDto | null }> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { userId, status: 'active' },
        relations: ['user'],
      });

      if (!subscription) {
        return {
          status: true,
          message: 'No active subscription found',
          data: null,
        };
      }

      return {
        status: true,
        message: 'Active subscription fetched successfully',
        data: this.mapToResponse(subscription),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Update subscription
   */
  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<{ status: boolean; message: string; data: SubscriptionResponseDto }> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { subscriptionId: id },
      });
      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      Object.assign(subscription, updateSubscriptionDto);
      subscription.updated_at = new Date();

      if (updateSubscriptionDto.payment_status === 'success') {
        subscription.payment_timestamp = new Date();
      }

      const updatedSubscription = await this.subscriptionRepository.save(subscription);
      return {
        status: true,
        message: 'Subscription updated successfully',
        data: this.mapToResponse(updatedSubscription),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Cancel subscription
   */
  async cancel(id: number): Promise<{ status: boolean; message: string }> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { subscriptionId: id },
      });
      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      subscription.status = 'cancelled';
      subscription.updated_at = new Date();
      await this.subscriptionRepository.save(subscription);

      return { status: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Get user subscription history
   */
  async getUserSubscriptionHistory(userId: number): Promise<{ status: boolean; message: string; data: SubscriptionResponseDto[] }> {
    try {
      const subscriptions = await this.subscriptionRepository.find({
        where: { userId },
        relations: ['user'],
        order: { created_at: 'DESC' },
      });

      return {
        status: true,
        message: 'Subscription history fetched successfully',
        data: subscriptions.map(s => this.mapToResponse(s)),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Helper: Map entity to response
   */
  private mapToResponse(subscription: Subscription): SubscriptionResponseDto {
    return {
      subscriptionId: subscription.subscriptionId,
      userId: subscription.userId,
      planId: subscription.planId,
      status: subscription.status,
      payment_status: subscription.payment_status,
      timestamp_from: subscription.timestamp_from,
      timestamp_to: subscription.timestamp_to,
      payment_method: subscription.payment_method,
      price_amount: Number(subscription.price_amount),
      paid_amount: Number(subscription.paid_amount),
      currency: subscription.currency,
    };
  }
}
