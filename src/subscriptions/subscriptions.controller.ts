import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Create a new subscription
   * POST /subscriptions
   */
  @Post()
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  /**
   * Get all subscriptions
   * GET /subscriptions
   */
  @Get()
  async findAll() {
    return this.subscriptionsService.findAll();
  }

  /**
   * Get subscription by ID
   * GET /subscriptions/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(Number(id));
  }

  /**
   * Get active subscription for user
   * GET /subscriptions/user/:userId/active
   */
  @Get('user/:userId/active')
  async getActiveSubscription(@Param('userId') userId: string) {
    return this.subscriptionsService.getActiveSubscription(Number(userId));
  }

  /**
   * Get user subscription history
   * GET /subscriptions/user/:userId/history
   */
  @Get('user/:userId/history')
  async getUserSubscriptionHistory(@Param('userId') userId: string) {
    return this.subscriptionsService.getUserSubscriptionHistory(Number(userId));
  }

  /**
   * Update subscription
   * PATCH /subscriptions/:id
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(Number(id), updateSubscriptionDto);
  }

  /**
   * Trigger Expiry Reminder SMS for subscriptions expiring soon
   * POST /subscriptions/send-expiry-reminders
   * GET /subscriptions/send-expiry-reminders
   */
  @Post('send-expiry-reminders')
  async sendExpiryRemindersPost(@Body() body: { daysAhead?: number }) {
    return this.subscriptionsService.sendExpiryReminders(body?.daysAhead || 3);
  }

  @Get('send-expiry-reminders')
  async sendExpiryRemindersGet() {
    return this.subscriptionsService.sendExpiryReminders(3);
  }

  /**
   * Manually trigger Subscription Success SMS for a subscription ID
   * POST /subscriptions/:id/send-success-sms
   */
  @Post(':id/send-success-sms')
  async sendSuccessSms(@Param('id') id: string) {
    const subRes = await this.subscriptionsService.findOne(Number(id));
    if (!subRes || !subRes.data) {
      return { status: false, message: 'Subscription not found' };
    }
    const fullSub = await this.subscriptionsService['subscriptionRepository'].findOne({
      where: { subscriptionId: Number(id) },
      relations: ['user', 'plan'],
    });
    if (!fullSub) {
      return { status: false, message: 'Subscription entity not found' };
    }
    const sent = await this.subscriptionsService.sendSubscriptionSuccessNotification(fullSub);
    return { status: sent, message: sent ? 'Subscription success SMS sent' : 'Failed to send SMS (check user mobile number)' };
  }

  /**
   * Cancel subscription
   * DELETE /subscriptions/:id
   */
  @Delete(':id')
  async cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(Number(id));
  }
}
