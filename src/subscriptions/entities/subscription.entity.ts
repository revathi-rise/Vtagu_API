import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('subscription')
export class Subscription {
  @PrimaryGeneratedColumn({ name: 'subscription_id' })
  subscriptionId: number;

  @Column({ name: 'plan_id' })
  planId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true, name: 'txn_id' })
  txnId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  paid_amount: number;

  @Column()
  timestamp_from: Date;

  @Column()
  timestamp_to: Date;

  @Column()
  payment_method: string; // 'credit_card', 'upi', 'wallet'

  @Column({ nullable: true, type: 'longtext' })
  payment_details: string;

  @Column({ default: 'pending' })
  payment_status: string; // 'pending', 'success', 'failed'

  @Column({ nullable: true })
  payment_timestamp: Date;

  @Column({ default: 'active' })
  status: string; // 'active', 'inactive', 'expired', 'cancelled'

  @Column({ default: 'INR' })
  currency: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;
}
