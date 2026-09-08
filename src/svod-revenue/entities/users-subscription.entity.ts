import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('users_subscription')
@Index('idx_user_month', ['userId', 'monthYear'])
@Index('idx_month_year', ['monthYear'])
export class UsersSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  userId: string;

  @Column({ name: 'subscription_fee', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  subscriptionFee: number;

  @Column({ name: 'gateway_fee', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  gatewayFee: number;

  @Column({ name: 'net_subscription_revenue', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  netSubscriptionRevenue: number;

  @Column({ name: 'month_year', type: 'varchar', length: 10 })
  monthYear: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
