import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionResponseDto } from './dto/subscription.dto';
import { Plan } from '../plans/entities/plan.entity';
import { User } from '../users/entities/user.entity';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private smsService: SmsService,
  ) { }

  /**
   * Create a new subscription
   */
  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<{ status: boolean; message: string; data: SubscriptionResponseDto }> {
    try {
      const { card_name, card_number, card_expiry, card_ccv, card_ccc, upi, plan_name, ...subscriptionFields } = createSubscriptionDto;
      const subscription = this.subscriptionRepository.create(subscriptionFields);
      subscription.status = 1; // Active

      // Resolve price, discount, and currency from the Plan if not provided
      let planPrice = 0;
      let planDiscount = 0;

      const plan = await this.planRepository.findOne({
        where: { planId: createSubscriptionDto.planId }
      });
      if (plan) {
        planPrice = plan.price;
        planDiscount = plan.discount;
      }

      subscription.price_amount = createSubscriptionDto.price_amount !== undefined
        ? createSubscriptionDto.price_amount
        : planPrice;

      subscription.paid_amount = createSubscriptionDto.paid_amount !== undefined
        ? createSubscriptionDto.paid_amount
        : (planPrice - planDiscount);

      if (subscription.paid_amount === 0) {
        subscription.payment_status = 2; // Success
        if (!subscription.payment_method) {
          subscription.payment_method = 'FREE';
        }
        if (!subscription.payment_timestamp) {
          subscription.payment_timestamp = Math.floor(Date.now() / 1000);
        }
      } else {
        subscription.payment_status = 1; // Pending
      }

      subscription.currency = createSubscriptionDto.currency || 'INR';

      if (!subscription.timestamp_from) {
        subscription.timestamp_from = Math.floor(Date.now() / 1000);
      }
      if (!subscription.timestamp_to) {
        subscription.timestamp_to = this.calculateTimestampTo(
          subscription.timestamp_from,
          plan?.validity
        );
      }

      const savedSubscription = await this.subscriptionRepository.save(subscription);
      if (plan) {
        savedSubscription.plan = plan;
      }

      // Sync plan and payment details to User entity in database
      if (createSubscriptionDto.userId) {
        const user = await this.userRepository.findOne({ where: { userId: createSubscriptionDto.userId } });
        if (user) {
          if (plan) {
            user.plan = String(plan.planId);
          } else if (createSubscriptionDto.planId) {
            user.plan = String(createSubscriptionDto.planId);
          }
          if (card_name) user.card_name = card_name;
          if (card_number) user.card_number = card_number;
          if (card_expiry) user.card_expiry = card_expiry;
          const ccv = card_ccv || card_ccc;
          if (ccv) user.card_ccv = ccv;
          if (upi) user.upi = upi;

          if (Number(savedSubscription.payment_status) === 2 && Number(savedSubscription.status) === 1 && plan) {
            if (Number(plan.unlimited) === 1 && Number(plan.isInteractiveIncluded) === 0) {
              user.standard_access = 1;
              user.interactive_access = 0;
            } else if (Number(plan.unlimited) === 0 && Number(plan.isInteractiveIncluded) === 1) {
              user.standard_access = 0;
              user.interactive_access = 1;
            } else if (Number(plan.unlimited) === 1 && Number(plan.isInteractiveIncluded) === 1) {
              user.standard_access = 1;
              user.interactive_access = 1;
            } else {
              user.standard_access = 0;
              user.interactive_access = 0;
            }
          }

          await this.userRepository.save(user);
        }
      }

      // If payment is successful upon creation, send Subscription Success SMS
      if (Number(savedSubscription.payment_status) === 2 && Number(savedSubscription.status) === 1) {
        await this.sendSubscriptionSuccessNotification(savedSubscription);
      }

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
   * Helper: Calculate timestamp_to based on plan validity string
   */
  private calculateTimestampTo(fromSec: number, validityStr?: string): number {
    if (!validityStr) return fromSec + (30 * 86400);

    const dateMatch = validityStr.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      const targetTime = Math.floor(new Date(dateMatch[0] + 'T23:59:59').getTime() / 1000);
      if (!isNaN(targetTime) && targetTime > fromSec) {
        return targetTime;
      }
    }

    let days = 30;
    const lower = validityStr.toLowerCase();
    if (lower.includes('year')) {
      const match = lower.match(/(\d+)/);
      const years = match ? parseInt(match[1]) : 1;
      days = years * 365;
    } else if (lower.includes('month')) {
      const match = lower.match(/(\d+)/);
      const months = match ? parseInt(match[1]) : 1;
      days = months * 30;
    } else if (lower.includes('day')) {
      const match = lower.match(/(\d+)/);
      days = match ? parseInt(match[1]) : 1;
    } else if (lower.includes('week')) {
      const match = lower.match(/(\d+)/);
      const weeks = match ? parseInt(match[1]) : 1;
      days = weeks * 7;
    }

    return fromSec + (days * 86400);
  }

  /**
   * Get all subscriptions
   */
  async findAll(): Promise<{ status: boolean; message: string; data: SubscriptionResponseDto[] }> {
    try {
      const subscriptions = await this.subscriptionRepository.find({
        relations: ['user', 'plan'],
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
        relations: ['user', 'plan'],
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
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const subscriptions = await this.subscriptionRepository.find({
        where: { userId, status: 1 },
        relations: ['user', 'plan'],
        order: { subscriptionId: 'DESC' },
      });

      let activeSub: Subscription | null = null;
      for (const sub of subscriptions) {
        const fromSec = Number(sub.timestamp_from) || 0;
        const toSec = Number(sub.timestamp_to) || 0;

        if (toSec > 0 && toSec < currentTimestamp) {
          sub.status = 0;
          await this.subscriptionRepository.save(sub);
          continue;
        }

        const isPaid = Number(sub.payment_status) === 2 || Number(sub.payment_status) === 1 || String(sub.payment_method).toUpperCase() === 'FREE';
        const isValidDate = (fromSec === 0 || fromSec <= currentTimestamp) && (toSec === 0 || toSec >= currentTimestamp);
        if (isPaid && isValidDate && !activeSub) {
          activeSub = sub;
        }
      }

      if (!activeSub) {
        // Revoke user access flags since there's no active subscription
        const user = await this.userRepository.findOne({ where: { userId } });
        if (user) {
          let updated = false;
          if (Number(user.standard_access) === 1) {
            user.standard_access = 0;
            updated = true;
          }
          if (Number(user.interactive_access) === 1) {
            user.interactive_access = 0;
            updated = true;
          }
          if (updated) {
            await this.userRepository.save(user);
          }
        }

        return {
          status: true,
          message: 'No active subscription found',
          data: null,
        };
      }

      // Auto-sync user access for old users whose flags were not updated
      if (activeSub.plan && Number(activeSub.status) === 1 && (Number(activeSub.payment_status) === 2 || String(activeSub.payment_method).toUpperCase() === 'FREE')) {
        const user = activeSub.user || await this.userRepository.findOne({ where: { userId } });
        if (user) {
          let updated = false;
          let expectedStandard = 0;
          let expectedInteractive = 0;

          if (Number(activeSub.plan.unlimited) === 1 && Number(activeSub.plan.isInteractiveIncluded) === 0) {
            expectedStandard = 1;
            expectedInteractive = 0;
          } else if (Number(activeSub.plan.unlimited) === 0 && Number(activeSub.plan.isInteractiveIncluded) === 1) {
            expectedStandard = 0;
            expectedInteractive = 1;
          } else if (Number(activeSub.plan.unlimited) === 1 && Number(activeSub.plan.isInteractiveIncluded) === 1) {
            expectedStandard = 1;
            expectedInteractive = 1;
          } else {
            expectedStandard = 0;
            expectedInteractive = 0;
          }

          if (Number(user.standard_access) !== expectedStandard) {
            user.standard_access = expectedStandard;
            updated = true;
          }
          if (Number(user.interactive_access) !== expectedInteractive) {
            user.interactive_access = expectedInteractive;
            updated = true;
          }

          if (updated) {
            await this.userRepository.save(user);
          }
        }
      }

      return {
        status: true,
        message: 'Active subscription fetched successfully',
        data: this.mapToResponse(activeSub),
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

      const { card_name, card_number, card_expiry, card_ccv, card_ccc, upi, plan_name, ...subUpdateFields } = updateSubscriptionDto;
      Object.assign(subscription, subUpdateFields);

      if (Number(updateSubscriptionDto.payment_status) === 2) { // Success
        subscription.payment_timestamp = Math.floor(Date.now() / 1000);
      }

      const updatedSubscription = await this.subscriptionRepository.save(subscription);
      const plan = await this.planRepository.findOne({
        where: { planId: updatedSubscription.planId },
      });
      if (plan) {
        updatedSubscription.plan = plan;
      }

      // Sync plan and payment details to User entity in database
      if (updatedSubscription.userId) {
        const user = await this.userRepository.findOne({ where: { userId: updatedSubscription.userId } });
        if (user) {
          if (plan) {
            user.plan = String(plan.planId);
          } else if (updatedSubscription.planId) {
            user.plan = String(updatedSubscription.planId);
          }
          if (card_name) user.card_name = card_name;
          if (card_number) user.card_number = card_number;
          if (card_expiry) user.card_expiry = card_expiry;
          const ccv = card_ccv || card_ccc;
          if (ccv) user.card_ccv = ccv;
          if (upi) user.upi = upi;

          if (Number(updatedSubscription.payment_status) === 2 && Number(updatedSubscription.status) === 1 && plan) {
            if (Number(plan.unlimited) === 1 && Number(plan.isInteractiveIncluded) === 0) {
              user.standard_access = 1;
              user.interactive_access = 0;
            } else if (Number(plan.unlimited) === 0 && Number(plan.isInteractiveIncluded) === 1) {
              user.standard_access = 0;
              user.interactive_access = 1;
            } else if (Number(plan.unlimited) === 1 && Number(plan.isInteractiveIncluded) === 1) {
              user.standard_access = 1;
              user.interactive_access = 1;
            } else {
              user.standard_access = 0;
              user.interactive_access = 0;
            }
          }

          await this.userRepository.save(user);
        }
      }

      // If payment_status was updated to success (2) or active, send Subscription Success SMS
      if (Number(updateSubscriptionDto.payment_status) === 2 || Number(updatedSubscription.payment_status) === 2) {
        await this.sendSubscriptionSuccessNotification(updatedSubscription);
      }

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
   * Helper: Send Subscription Success SMS Notification
   */
  async sendSubscriptionSuccessNotification(subscription: Subscription): Promise<boolean> {
    try {
      const user = subscription.user || await this.userRepository.findOne({ where: { userId: subscription.userId } });
      const plan = subscription.plan || await this.planRepository.findOne({ where: { planId: subscription.planId } });

      if (user && user.mobile) {
        const planName = plan ? plan.name : 'Subscription';
        const validTillDate = this.smsService.formatDateForSms(subscription.timestamp_to);
        const amount = subscription.paid_amount !== undefined ? subscription.paid_amount : (plan ? plan.price : 0);

        return await this.smsService.sendSubscriptionSuccessSms(
          user.mobile,
          user.user_name,
          planName,
          amount,
          validTillDate,
        );
      }
      return false;
    } catch (error) {
      console.error('Error sending subscription success SMS:', error.message);
      return false;
    }
  }

  /**
   * Check active subscriptions expiring within N days and send Expiry Reminder SMS
   */
  async sendExpiryReminders(daysAhead: number = 3): Promise<{ status: boolean; message: string; countSent: number }> {
    try {
      const nowSec = Math.floor(Date.now() / 1000);
      const targetSec = nowSec + (daysAhead * 86400);

      // Find active & paid subscriptions
      const subscriptions = await this.subscriptionRepository.find({
        where: { status: 1, payment_status: 2 },
        relations: ['user', 'plan'],
      });

      let countSent = 0;
      for (const sub of subscriptions) {
        // Check if subscription expires within the window
        if (sub.timestamp_to >= nowSec && sub.timestamp_to <= targetSec) {
          const user = sub.user || await this.userRepository.findOne({ where: { userId: sub.userId } });
          const plan = sub.plan || await this.planRepository.findOne({ where: { planId: sub.planId } });

          if (user && user.mobile) {
            const planName = plan ? plan.name : 'Subscription';
            const expiryDate = this.smsService.formatDateForSms(sub.timestamp_to);

            const sent = await this.smsService.sendExpiryReminderSms(
              user.mobile,
              user.user_name,
              planName,
              expiryDate,
            );

            if (sent) countSent++;
          }
        }
      }

      return {
        status: true,
        message: `Successfully processed expiry reminders. Sent ${countSent} SMS notification(s).`,
        countSent,
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

      subscription.status = 0; // Cancelled
      await this.subscriptionRepository.save(subscription);

      // Verify and revoke access if no other active subscriptions exist
      await this.getActiveSubscription(subscription.userId);

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
        relations: ['user', 'plan'],
        order: { subscriptionId: 'DESC' },
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
    const plan = subscription.plan;
    const hasQuality = plan && plan.quality && plan.quality.trim() !== '' && plan.quality.trim().toLowerCase() !== 'none';
    const isStandard = hasQuality ? 1 : 0;
    const isInteractive = plan ? (plan.isInteractiveIncluded || 0) : 0;

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
      is_interactive_included: isInteractive,
      isInteractiveIncluded: isInteractive,
      is_standard_included: isStandard,
      isStandardIncluded: isStandard,
      plan: plan ? {
        planId: plan.planId,
        name: plan.name,
        price: plan.price,
        validity: plan.validity,
        is_interactive_included: isInteractive,
        isInteractiveIncluded: isInteractive,
        is_standard_included: isStandard,
        isStandardIncluded: isStandard,
        screens: plan.screens,
        quality: plan.quality,
        compatibility: plan.compatibility || 0,
        unlimited: plan.unlimited || 0,
        cancellation: plan.cancellation || 0,
      } : undefined,
    };
  }
}
