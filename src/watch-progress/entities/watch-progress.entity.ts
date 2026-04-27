import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ContentType {
  MOVIE = 'movie',
  EPISODE = 'episode',
}

@Entity('watch_progress')
@Unique('unique_user_content', ['userId', 'contentId', 'contentType'])
export class WatchProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'content_id' })
  contentId: number;

  @Column({
    type: 'enum',
    enum: ContentType,
    name: 'content_type',
  })
  contentType: ContentType;

  @Column({ name: 'watched_duration', default: 0 })
  watchedDuration: number;

  @Column({ name: 'total_duration', default: 0 })
  totalDuration: number;

  @Column({ name: 'progress_percentage', default: 0 })
  progressPercentage: number;

  @UpdateDateColumn({ name: 'last_watched_at' })
  lastWatchedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
