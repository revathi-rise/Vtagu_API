import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('watch_sessions')
@Index('idx_watch_user', ['userId'])
@Index('idx_watch_film', ['filmId'])
@Index('idx_watch_user_film', ['userId', 'filmId'])
@Index('idx_watch_timestamp', ['timestamp'])
export class WatchSessionLog {
  @PrimaryColumn({ name: 'session_id', type: 'varchar', length: 255 })
  sessionId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  userId: string;

  @Column({ name: 'film_id', type: 'varchar', length: 255 })
  filmId: string;

  @Column({ name: 'seconds_watched', type: 'int', default: 0 })
  secondsWatched: number;

  @CreateDateColumn({ name: 'timestamp', type: 'datetime' })
  timestamp: Date;
}
