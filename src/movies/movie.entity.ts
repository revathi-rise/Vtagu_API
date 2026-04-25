import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('movie')
export class Movie {
  @PrimaryGeneratedColumn()
  movie_id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ name: 'description_short', type: 'text', nullable: true })
  description_short: string;

  @Column({ name: 'description_long', type: 'text', nullable: true })
  description_long: string;

  @Column({ nullable: true })
  year: number;

  @Column({ name: 'country_id', nullable: true })
  country_id: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rating: number;

  @Column({ name: 'genre_id', nullable: true })
  genre_id: number;

  @Column({ name: 'age_group', nullable: true })
  age_group: string;

  @Column({ type: 'text', nullable: true })
  actors: string;

  @Column({ nullable: true })
  director: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: false })
  free: boolean;

  @Column({ name: 'movie_type', nullable: true })
  movie_type: string;

  @Column({ nullable: true })
  type: string;

  @Column({ name: 'age_restriction', nullable: true })
  age_restriction: string;

  @Column({ name: 'kids_restriction', default: false })
  kids_restriction: boolean;

  @Column({ nullable: true })
  url: string;

  @Column({ name: 'trailer_url', nullable: true })
  trailer_url: string;

  @Column({ name: 'trailer_alt', nullable: true })
  trailer_alt: string;

  @Column({ name: 'movie_image', nullable: true })
  movie_image: string;

  @Column({ name: 'poster_alt', nullable: true })
  poster_alt: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ type: 'text', nullable: true })
  languages: string;

  @Column({ name: 'view_count', default: 0 })
  view_count: number;

  @Column({ name: 'is_interactive', default: false })
  is_interactive: boolean;

  @Column({ name: 'interactive_map', type: 'text', nullable: true })
  interactive_map: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
