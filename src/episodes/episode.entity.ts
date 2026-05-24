import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('episode')
export class Episode {
  @PrimaryGeneratedColumn({ name: 'episode_id' })
  episode_id: number;

  @Column({ name: 'season_id' })
  season_id: number;

  @Column({ nullable: true })
  episode_number: number;

  @Column({ nullable: true, unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ name: 'description_short', type: 'text', nullable: true })
  description_short: string;

  @Column({ name: 'description_long', type: 'text', nullable: true })
  description_long: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  url: string;

  @Column({ name: 'trailer_url', nullable: true })
  trailer_url: string;

  @Column({ name: 'trailer_alt', nullable: true })
  trailer_alt: string;

  @Column({ nullable: true })
  image: string;

  @Column({ name: 'poster_image', nullable: true })
  poster_image: string;

  @Column({ name: 'card_image', nullable: true })
  card_image: string;

  @Column({ name: 'poster_alt', nullable: true })
  poster_alt: string;

  @Column({ type: 'text', nullable: true })
  languages: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rating: number;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: false })
  free: boolean;

  @Column({ name: 'view_count', default: 0 })
  view_count: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
