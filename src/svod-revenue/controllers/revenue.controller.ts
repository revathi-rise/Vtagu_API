import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SvodRevenueService } from '../svod-revenue.service';
import { RunMonthlySplitDto, CreateUserSubscriptionDto } from '../dto/svod-revenue.dto';

@Controller('v1/revenue')
export class RevenueController {
  constructor(private readonly svodRevenueService: SvodRevenueService) {}

  @Post('run-monthly-split')
  async runMonthlySplit(@Body() dto: RunMonthlySplitDto) {
    return this.svodRevenueService.runMonthlySplit(dto);
  }

  @Post('user-subscriptions')
  async recordUserSubscription(@Body() dto: CreateUserSubscriptionDto) {
    return this.svodRevenueService.recordUserSubscription(dto);
  }

  @Get('title-ledger')
  async getTitleLedger(@Query('month_year') monthYear?: string) {
    return this.svodRevenueService.getTitleLedger(monthYear);
  }
}
