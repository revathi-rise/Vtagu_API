import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('watch_session')
export class WatchSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'session_id', unique: true })
  sessionId: string;

  @Column({ name: 'content_id' })
  contentId: number;

  @Column({ name: 'content_type' })
  contentType: string;

  @UpdateDateColumn({ name: 'last_ping_at', type: 'timestamp' })
  lastPingAt: Date;
}
