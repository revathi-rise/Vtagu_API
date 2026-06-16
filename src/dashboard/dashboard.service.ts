import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Movie } from '../movies/movie.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Genre } from '../genres/genre.entity';
import { MoviesService } from '../movies/movies.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
    private moviesService: MoviesService,
  ) {}

  async getStats() {
    // 1. Overview counts
    const totalUsers = await this.userRepository.count();

    // Count movies: where movie_type != 'series' or is null
    const totalMovies = await this.movieRepository
      .createQueryBuilder('movie')
      .where('LOWER(movie.movie_type) != :type OR movie.movie_type IS NULL', { type: 'series' })
      .getCount();

    // Count series: where movie_type == 'series'
    const totalSeries = await this.movieRepository
      .createQueryBuilder('movie')
      .where('LOWER(movie.movie_type) = :type', { type: 'series' })
      .getCount();

    const activeSubs = await this.subscriptionRepository.count({
      where: { status: 1 },
    });

    const revenueResult = await this.subscriptionRepository
      .createQueryBuilder('sub')
      .select('SUM(sub.paid_amount)', 'sum')
      .getRawOne();
    const totalRevenue = parseFloat(revenueResult?.sum || '0');

    const viewsResult = await this.movieRepository
      .createQueryBuilder('movie')
      .select('SUM(movie.view_count)', 'sum')
      .getRawOne();
    const totalViews = parseInt(viewsResult?.sum || '0', 10);

    // 2. Trending movies (top 5 by view_count)
    const trendingMoviesRaw = await this.movieRepository.find({
      order: { view_count: 'DESC' },
      take: 5,
    });
    const trendingMovies = trendingMoviesRaw.map((m) => this.moviesService.mapToResponse(m));

    // 3. Revenue Growth (last 7 months)
    const monthsList = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Calculate the start date for the last 7 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"
      monthsList.push({
        key: monthKey,
        name: monthNames[d.getMonth()],
        revenue: 0,
        users: 0,
      });
    }

    // Query new users grouped by month
    const usersGrouped = await this.userRepository
      .createQueryBuilder('user')
      .select("DATE_FORMAT(user.created_at, '%Y-%m')", 'month')
      .addSelect('COUNT(user.user_id)', 'count')
      .where('user.created_at >= :startDate', { startDate })
      .groupBy('month')
      .getRawMany();

    // Query subscriptions revenue grouped by month
    const revGrouped = await this.subscriptionRepository
      .createQueryBuilder('sub')
      .select("DATE_FORMAT(FROM_UNIXTIME(sub.timestamp_from), '%Y-%m')", 'month')
      .addSelect('SUM(sub.paid_amount)', 'revenue')
      .where('FROM_UNIXTIME(sub.timestamp_from) >= :startDate', { startDate })
      .groupBy('month')
      .getRawMany();

    const userMap = new Map(usersGrouped.map((u) => [u.month, parseInt(u.count, 10)]));
    const revMap = new Map(revGrouped.map((r) => [r.month, parseFloat(r.revenue || '0')]));

    const revenueData = monthsList.map((m) => ({
      name: m.name,
      revenue: revMap.get(m.key) || 0,
      users: userMap.get(m.key) || 0,
    }));

    // 4. Popular Genres (top 5 genres based on movie counts)
    const genreCounts = await this.movieRepository
      .createQueryBuilder('movie')
      .innerJoin(Genre, 'genre', 'movie.genre_id = genre.genre_id')
      .select('genre.name', 'name')
      .addSelect('COUNT(movie.movie_id)', 'count')
      .groupBy('genre.name')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const totalMoviesForPercentage = genreCounts.reduce((sum, row) => sum + parseInt(row.count, 10), 0);
    const topGenres = genreCounts.map((row) => {
      const countVal = parseInt(row.count, 10);
      const percentage = totalMoviesForPercentage > 0 ? Math.round((countVal / totalMoviesForPercentage) * 100) : 0;
      return {
        name: row.name,
        count: percentage,
      };
    });

    // 5. Recent Activities
    const recentUsers = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentSubs = await this.subscriptionRepository.find({
      relations: ['user'],
      order: { subscriptionId: 'DESC' },
      take: 5,
    });

    const activities = [];

    for (const user of recentUsers) {
      activities.push({
        id: `user-${user.userId}`,
        type: 'signup',
        message: `New user registered: ${user.user_name || user.email}`,
        timestamp: new Date(user.createdAt),
      });
    }

    for (const sub of recentSubs) {
      activities.push({
        id: `sub-${sub.subscriptionId}`,
        type: 'subscription',
        message: `${sub.user?.user_name || 'A user'} subscribed to Plan #${sub.planId} (${sub.currency} ${sub.paid_amount})`,
        timestamp: new Date(sub.timestamp_from * 1000),
      });
    }

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const formatRelativeTime = (date: Date): string => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    };

    const recentActivities = activities.slice(0, 5).map((act) => ({
      id: act.id,
      type: act.type,
      message: act.message,
      time: formatRelativeTime(act.timestamp),
    }));

    return {
      totalUsers,
      totalMovies,
      totalSeries,
      activeSubs,
      revenue: totalRevenue,
      totalViews,
      trendingMovies,
      revenueData,
      topGenres,
      recentActivities,
    };
  }
}
