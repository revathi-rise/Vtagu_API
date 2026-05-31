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

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
