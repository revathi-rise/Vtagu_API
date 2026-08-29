import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Unique } from 'typeorm';

@Entity('user_watchlist')
@Unique(['userId', 'contentId', 'contentType'])
export class Watchlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'content_id' })
  contentId: number;

  @Column({ name: 'content_type', default: 'movie' })
  contentType: string; // 'movie', 'series', 'interactive_movie', 'short'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
