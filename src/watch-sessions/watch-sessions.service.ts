import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { WatchSession } from './entities/watch-session.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';
import { WatchSessionPingDto } from './dto/watch-session-ping.dto';

@Injectable()
export class WatchSessionsService {
  constructor(
    @InjectRepository(WatchSession)
    private readonly watchSessionRepository: Repository<WatchSession>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async ping(dto: WatchSessionPingDto): Promise<{ status: boolean; message: string; limit?: number; activeCount?: number }> {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    // 1. Purge sessions that haven't pinged in the last 45 seconds
    const staleTime = new Date(Date.now() - 45000);
    await this.watchSessionRepository.delete({
      lastPingAt: LessThan(staleTime),
    });

    // 2. Determine screens limit
    const activeSubs = await this.subscriptionRepository.find({
      where: { userId: dto.userId, status: 1 },
    });
    
    let maxScreens = 0;
    let hasActiveSubscription = false;
    for (const sub of activeSubs) {
      if (sub.payment_status === 2 && sub.timestamp_from <= currentTimestamp && sub.timestamp_to >= currentTimestamp) {
        const plan = await this.planRepository.findOne({ where: { planId: sub.planId } });
        if (plan) {
          hasActiveSubscription = true;
          if (plan.screens > maxScreens) {
            maxScreens = plan.screens;
          }
        }
      }
    }
    
    const limit = hasActiveSubscription ? (maxScreens > 0 ? maxScreens : 1) : 999;

    // 3. Check if session already exists
    let session = await this.watchSessionRepository.findOne({
      where: { sessionId: dto.sessionId },
    });

    const activeCount = await this.watchSessionRepository.count({
      where: { userId: dto.userId },
    });

    if (!session) {
      // New session request
      if (activeCount >= limit) {
        return {
          status: false,
          message: 'LIMIT_EXCEEDED',
          limit,
          activeCount,
        };
      }
      
      session = this.watchSessionRepository.create({
        userId: dto.userId,
        sessionId: dto.sessionId,
        contentId: dto.contentId,
        contentType: dto.contentType,
      });
    } else {
      // Existing session ping - update metadata and timestamp
      session.userId = dto.userId;
      session.contentId = dto.contentId;
      session.contentType = dto.contentType;
      session.lastPingAt = new Date();
    }

    await this.watchSessionRepository.save(session);
    
    return {
      status: true,
      message: 'Ping successful',
      limit,
      activeCount: session ? activeCount : activeCount + 1,
    };
  }

  async exit(sessionId: string): Promise<{ status: boolean; message: string }> {
    await this.watchSessionRepository.delete({ sessionId });
    return { status: true, message: 'Session exited' };
  }
}
