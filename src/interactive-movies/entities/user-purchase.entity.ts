import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InteractiveMovie } from './interactive-movie.entity';

@Entity('user_interactive_movie_purchases')
export class UserInteractiveMoviePurchase {
  @PrimaryGeneratedColumn({ name: 'purchase_id' })
  purchaseId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'interactive_movie_id' })
  interactiveMovieId: number;

  @ManyToOne(() => InteractiveMovie)
  @JoinColumn({ name: 'interactive_movie_id' })
  movie: InteractiveMovie;

  @Column({ name: 'txn_id', length: 100, nullable: true })
  txnId: string;

  @Column({ type: 'float' })
  paidAmount: number;

  @Column({ length: 10 })
  currency: string;

  @Column({ type: 'int', default: 1 })
  status: number; // 1 - Active, 0 - Expired/Refunded

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
