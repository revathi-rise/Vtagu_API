import { Controller, Post, Body } from '@nestjs/common';
import { SvodRevenueService } from '../svod-revenue.service';
import { LogWatchTimeDto } from '../dto/svod-revenue.dto';

@Controller('v1/tracking')
export class TrackingController {
  constructor(private readonly svodRevenueService: SvodRevenueService) {}

  @Post('log-watch-time')
  async logWatchTime(@Body() dto: LogWatchTimeDto) {
    return this.svodRevenueService.logWatchTime(dto);
  }
}
