import { Controller, Post, Body } from '@nestjs/common';
import { WatchSessionsService } from './watch-sessions.service';
import { WatchSessionPingDto } from './dto/watch-session-ping.dto';

@Controller('watch-sessions')
export class WatchSessionsController {
  constructor(private readonly watchSessionsService: WatchSessionsService) {}

  @Post('ping')
  async ping(@Body() dto: WatchSessionPingDto) {
    return this.watchSessionsService.ping(dto);
  }

  @Post('exit')
  async exit(@Body('sessionId') sessionId: string) {
    return this.watchSessionsService.exit(sessionId);
  }
}
