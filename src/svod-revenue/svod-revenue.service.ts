import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UsersSubscription } from './entities/users-subscription.entity';
import { WatchSessionLog } from './entities/watch-session-log.entity';
import { TitleLedger } from './entities/title-ledger.entity';
import { LogWatchTimeDto, RunMonthlySplitDto, CreateUserSubscriptionDto } from './dto/svod-revenue.dto';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Movie } from '../movies/movie.entity';
import { Episode } from '../episodes/episode.entity';
import { InteractiveMovie } from '../interactive-movies/entities/interactive-movie.entity';

@Injectable()
export class SvodRevenueService {
  constructor(
    @InjectRepository(UsersSubscription)
    private readonly usersSubscriptionRepo: Repository<UsersSubscription>,
    @InjectRepository(WatchSessionLog)
    private readonly watchSessionLogRepo: Repository<WatchSessionLog>,
    @InjectRepository(TitleLedger)
    private readonly titleLedgerRepo: Repository<TitleLedger>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Episode)
    private readonly episodeRepo: Repository<Episode>,
    @InjectRepository(InteractiveMovie)
    private readonly interactiveMovieRepo: Repository<InteractiveMovie>,
  ) {}

  /**
   * Helper to format Date object into MM-YYYY string
   */
  private formatMonthYear(date: Date = new Date()): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
  }

  /**
   * Endpoint A: Log watch time pings from React Native client
   */
  async logWatchTime(dto: LogWatchTimeDto) {
    try {
      const sessionId = crypto.randomUUID();
      const watchLog = this.watchSessionLogRepo.create({
        sessionId,
        userId: dto.user_id,
        filmId: dto.film_id,
        secondsWatched: dto.seconds_watched,
        timestamp: new Date(),
      });

      const saved = await this.watchSessionLogRepo.save(watchLog);

      return {
        status: true,
        message: 'Watch time logged successfully',
        data: {
          session_id: saved.sessionId,
          user_id: saved.userId,
          film_id: saved.filmId,
          seconds_watched: saved.secondsWatched,
          timestamp: saved.timestamp,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to log watch time: ${error.message}`);
    }
  }

  /**
   * Record/seed user monthly subscription fee & gateway fee
   */
  async recordUserSubscription(dto: CreateUserSubscriptionDto) {
    try {
      const monthYear = dto.month_year || this.formatMonthYear();
      const gatewayFee = dto.gateway_fee !== undefined ? dto.gateway_fee : 2.50;
      const netRevenue = Math.max(0, dto.subscription_fee - gatewayFee);

      let record = await this.usersSubscriptionRepo.findOne({
        where: { userId: dto.user_id, monthYear },
      });

      if (!record) {
        record = this.usersSubscriptionRepo.create({
          userId: dto.user_id,
          subscriptionFee: dto.subscription_fee,
          gatewayFee,
          netSubscriptionRevenue: netRevenue,
          monthYear,
        });
      } else {
        record.subscriptionFee = dto.subscription_fee;
        record.gatewayFee = gatewayFee;
        record.netSubscriptionRevenue = netRevenue;
      }

      const saved = await this.usersSubscriptionRepo.save(record);

      return {
        status: true,
        message: 'User subscription pool recorded successfully',
        data: {
          id: saved.id,
          user_id: saved.userId,
          subscription_fee: Number(saved.subscriptionFee),
          gateway_fee: Number(saved.gatewayFee),
          net_subscription_revenue: Number(saved.netSubscriptionRevenue),
          month_year: saved.monthYear,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to record user subscription: ${error.message}`);
    }
  }

  /**
   * Endpoint B: Pro-Rata Monthly Split Engine
   * Calculates time percentage per user per title and allocates net subscription revenue to Title Ledger
   */
  async runMonthlySplit(dto?: RunMonthlySplitDto) {
    try {
      const targetMonthYear = dto?.month_year || this.formatMonthYear();

      // 1. Fetch user subscriptions for the target month
      const userSubscriptions = await this.usersSubscriptionRepo.find({
        where: { monthYear: targetMonthYear },
      });

      // Build net revenue map by user_id
      const userNetRevenueMap = new Map<string, number>();
      for (const sub of userSubscriptions) {
        userNetRevenueMap.set(sub.userId, Number(sub.netSubscriptionRevenue));
      }

      // 2. Fetch all watch logs
      const watchLogs = await this.watchSessionLogRepo.find();

      // Filter logs matching target monthYear (by comparing timestamp MM-YYYY or all logs if timestamp matches target)
      const monthlyLogs = watchLogs.filter((log) => {
        if (!log.timestamp) return true;
        const logMonthYear = this.formatMonthYear(new Date(log.timestamp));
        return logMonthYear === targetMonthYear;
      });

      // Group watch time by user and title
      // userTotalSeconds: Map<userId, totalSeconds>
      // userTitleSeconds: Map<userId, Map<filmId, seconds>>
      const userTotalSeconds = new Map<string, number>();
      const userTitleSeconds = new Map<string, Map<string, number>>();

      for (const log of monthlyLogs) {
        const uId = log.userId;
        const fId = log.filmId;
        const secs = Number(log.secondsWatched) || 0;

        // User total seconds
        const currentTotal = userTotalSeconds.get(uId) || 0;
        userTotalSeconds.set(uId, currentTotal + secs);

        // User title seconds
        if (!userTitleSeconds.has(uId)) {
          userTitleSeconds.set(uId, new Map<string, number>());
        }
        const titleMap = userTitleSeconds.get(uId)!;
        const currentTitleSecs = titleMap.get(fId) || 0;
        titleMap.set(fId, currentTitleSecs + secs);
      }

      // 3. Pro-Rata Calculation per user & title allocation
      const titleAllocatedRevenueMap = new Map<string, number>();
      const titleTotalSecondsMap = new Map<string, number>();
      let totalPlatformSeconds = 0;
      let totalDistributedRevenue = 0;
      const processedUserIds = new Set<string>();

      // Fetch all movies into an indexed Map for zero-lag O(1) revenue management status checking
      const allMovies = await this.movieRepo.find({
        select: ['movie_id', 'title', 'slug', 'is_revenue_managed'],
      });
      const revenueManagedMap = new Map<string, boolean>();
      for (const m of allMovies) {
        const isManaged = Boolean(m.is_revenue_managed);
        if (m.movie_id) revenueManagedMap.set(String(m.movie_id), isManaged);
        if (m.title) revenueManagedMap.set(m.title.toLowerCase().trim(), isManaged);
        if (m.slug) revenueManagedMap.set(m.slug.toLowerCase().trim(), isManaged);
      }

      const allEpisodes = await this.episodeRepo.find({
        select: ['episode_id', 'title', 'slug', 'is_revenue_managed'],
      });
      for (const ep of allEpisodes) {
        const isManaged = Boolean(ep.is_revenue_managed);
        if (ep.episode_id) revenueManagedMap.set(`ep_${ep.episode_id}`, isManaged);
        if (ep.title) revenueManagedMap.set(ep.title.toLowerCase().trim(), isManaged);
        if (ep.slug) revenueManagedMap.set(`ep_${ep.slug.toLowerCase().trim()}`, isManaged);
      }

      const allInteractiveMovies = await this.interactiveMovieRepo.find({
        select: ['interactive_movie_id', 'title', 'is_revenue_managed'],
      });
      for (const im of allInteractiveMovies) {
        const isManaged = Boolean(im.is_revenue_managed);
        if (im.interactive_movie_id) revenueManagedMap.set(`im_${im.interactive_movie_id}`, isManaged);
        if (im.title) revenueManagedMap.set(im.title.toLowerCase().trim(), isManaged);
      }

      const isTitleRevenueManaged = (filmId: string): boolean => {
        if (!filmId) return true;
        const normalized = filmId.toLowerCase().trim();
        if (revenueManagedMap.has(normalized)) {
          return revenueManagedMap.get(normalized)!;
        }
        if (revenueManagedMap.has(filmId)) {
          return revenueManagedMap.get(filmId)!;
        }
        return true; // Default fallback to eligible if film is unknown
      };

      for (const [userId, totalSecs] of userTotalSeconds.entries()) {
        if (totalSecs <= 0) continue;
        processedUserIds.add(userId);

        // Get user net subscription revenue, with fallback to core subscription table if missing in users_subscription table
        let netRevenue = userNetRevenueMap.get(userId);
        if (netRevenue === undefined) {
          // Attempt fallback lookup from Subscription repository
          const numericUserId = parseInt(userId, 10);
          if (!isNaN(numericUserId)) {
            const activeSub = await this.subscriptionRepo.findOne({
              where: { userId: numericUserId, status: 1 },
            });
            if (activeSub) {
              const fee = Number(activeSub.paid_amount || activeSub.price_amount || 0);
              const gateway = 2.50;
              netRevenue = Math.max(0, fee - gateway);
            }
          }
        }

        const userNetRev = netRevenue || 0;
        const titleMap = userTitleSeconds.get(userId);
        if (!titleMap) continue;

        for (const [filmId, filmSecs] of titleMap.entries()) {
          // Verify if movie is marked for revenue management in Admin Portal
          if (!isTitleRevenueManaged(filmId)) {
            continue; // Skip revenue split allocation for non-revenue managed titles
          }

          const percentage = filmSecs / totalSecs;
          const allocatedForTitle = userNetRev * percentage;

          // Accumulate revenue allocation
          const currentTitleRev = titleAllocatedRevenueMap.get(filmId) || 0;
          titleAllocatedRevenueMap.set(filmId, currentTitleRev + allocatedForTitle);

          // Accumulate total seconds watched per title
          const currentFilmSecs = titleTotalSecondsMap.get(filmId) || 0;
          titleTotalSecondsMap.set(filmId, currentFilmSecs + filmSecs);

          totalPlatformSeconds += filmSecs;
          totalDistributedRevenue += allocatedForTitle;
        }
      }

      // 4. Save/Update TitleLedger entries
      const titleBreakdown = [];
      for (const [filmId, allocatedRev] of titleAllocatedRevenueMap.entries()) {
        const roundedRevenue = Math.round(allocatedRev * 10000) / 10000;
        const filmSecs = titleTotalSecondsMap.get(filmId) || 0;
        const filmPercentage = totalPlatformSeconds > 0 ? (filmSecs / totalPlatformSeconds) * 100 : 0;

        let ledgerEntry = await this.titleLedgerRepo.findOne({
          where: { filmId, monthYear: targetMonthYear },
        });

        if (!ledgerEntry) {
          ledgerEntry = this.titleLedgerRepo.create({
            filmId,
            monthYear: targetMonthYear,
            totalAllocatedRevenue: roundedRevenue,
          });
        } else {
          ledgerEntry.totalAllocatedRevenue = roundedRevenue;
        }

        await this.titleLedgerRepo.save(ledgerEntry);

        titleBreakdown.push({
          film_id: filmId,
          total_seconds_watched: filmSecs,
          watch_percentage: `${filmPercentage.toFixed(2)}%`,
          total_allocated_revenue: roundedRevenue,
        });
      }

      return {
        status: true,
        message: `Monthly Pro-Rata revenue split completed for ${targetMonthYear}`,
        data: {
          month_year: targetMonthYear,
          users_processed_count: processedUserIds.size,
          total_platform_seconds_watched: totalPlatformSeconds,
          total_revenue_allocated: Math.round(totalDistributedRevenue * 100) / 100,
          titles_ledger: titleBreakdown,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to execute monthly split: ${error.message}`);
    }
  }

  /**
   * Helper to fetch title ledger entries
   */
  async getTitleLedger(monthYear?: string) {
    const targetMonthYear = monthYear || this.formatMonthYear();
    const records = await this.titleLedgerRepo.find({
      where: { monthYear: targetMonthYear },
      order: { totalAllocatedRevenue: 'DESC' },
    });

    return {
      status: true,
      message: 'Title ledger fetched successfully',
      data: records.map((r) => ({
        id: r.id,
        film_id: r.filmId,
        month_year: r.monthYear,
        total_allocated_revenue: Number(r.totalAllocatedRevenue),
        updated_at: r.updatedAt,
      })),
    };
  }
}
