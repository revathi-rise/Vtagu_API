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

  @Column({ nullable: true, name: 'txn_id', length: 100 })
  txnId: string;

  @Column({ type: 'float' })
  price_amount: number;

  @Column({ type: 'float' })
  paid_amount: number;

  @Column({ type: 'int' })
  timestamp_from: number;

  @Column({ type: 'int' })
  timestamp_to: number;

  @Column({ length: 255, nullable: true })
  payment_method: string;

  @Column({ type: 'text', nullable: true })
  payment_details: string;

  @Column({ type: 'int', default: 1 })
  payment_status: number; // 1- Pending / 2 - Success / 3 - Failed

  @Column({ type: 'int', nullable: true })
  payment_timestamp: number;

  @Column({ type: 'int', default: 1 })
  status: number; // 1 active, 0 cancelled

  @Column({ length: 20 })
  currency: string;
}
