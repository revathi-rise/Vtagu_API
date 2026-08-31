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
   * Get active subscription for user (with route aliases)
   * GET /subscriptions/user/:userId/active
   * GET /subscriptions/user/:userId
   * GET /subscriptions/active/:userId
   */
  @Get('user/:userId/active')
  async getActiveSubscription(@Param('userId') userId: string) {
    return this.subscriptionsService.getActiveSubscription(Number(userId));
  }

  @Get('user/:userId')
  async getActiveSubscriptionByUserAlias(@Param('userId') userId: string) {
    if (!isNaN(Number(userId))) {
      return this.subscriptionsService.getActiveSubscription(Number(userId));
    }
    return { status: false, message: 'Invalid user ID' };
  }

  @Get('active/:userId')
  async getActiveSubscriptionAlias(@Param('userId') userId: string) {
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
   * Get subscription by ID (Wildcard - must be placed after specific routes)
   * GET /subscriptions/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (isNaN(Number(id))) {
      return { status: false, message: 'Invalid subscription ID' };
    }
    return this.subscriptionsService.findOne(Number(id));
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
   * Cancel subscription
   * DELETE /subscriptions/:id
   */
  @Delete(':id')
  async cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(Number(id));
  }
}
