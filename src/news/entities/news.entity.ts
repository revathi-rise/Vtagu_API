import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  news_id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'Image', nullable: true })
  image: string;

  @Column({ nullable: true })
  year: number;

  @Column({ name: 'country_id', nullable: true })
  country_id: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rating: number;

  @Column({ name: 'free', default: 0 })
  free: number;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ name: 'view_count', default: 0 })
  view_count: number;

  @CreateDateColumn({ name: 'created_on' })
  created_on: Date;
}
