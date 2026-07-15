import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('interactive_movies')
export class InteractiveMovie {
  @PrimaryGeneratedColumn({ name: 'interactive_movie_id' })
  interactive_movie_id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ name: 'banner_image', nullable: true })
  banner_image: string;

  @Column({ name: 'card_image', nullable: true })
  card_image: string;

  @Column({ name: 'trailer_video_url', nullable: true })
  trailer_video_url: string;

  @Column({ type: 'text', nullable: true })
  languages: string;

  @Column({ type: 'tinyint', default: 0, name: 'is_free' })
  is_free: number;

  @Column({ type: 'float', default: 0.0, name: 'price' })
  price: number;

  @Column({ length: 10, default: 'INR', name: 'currency' })
  currency: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

