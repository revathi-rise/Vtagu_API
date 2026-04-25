import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
// import { MovieNew } from '../../movies-new/entities/movie-new.entity';

export enum ContentType {
  MOVIE = 'movie',
  SERIES = 'series',
}

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn()
  content_id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 191 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ContentType,
  })
  content_type: ContentType;

  @Column({ nullable: true })
  release_year: number;

  @Column({ length: 255, nullable: true })
  poster_url: string;

  @Column({ length: 255, nullable: true })
  trailer_url: string;

  @Column({ length: 255, nullable: true })
  video_url: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rating: number;

  @Column({ nullable: true })
  subscription_plan_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // @OneToMany(() => MovieNew, (movieNew) => movieNew.content)
  // movie_news: MovieNew[];
}
