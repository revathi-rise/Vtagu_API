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
   * Cancel subscription
   * DELETE /subscriptions/:id
   */
  @Delete(':id')
  async cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(Number(id));
  }
}
