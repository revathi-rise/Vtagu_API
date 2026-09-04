import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shorts')
export class Short {
  @PrimaryGeneratedColumn({ name: 'short_id' })
  short_id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'video_url', type: 'varchar', length: 1000, nullable: false })
  video_url: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 1000, nullable: true })
  thumbnail_url: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  languages: string;

  @Column({ name: 'genre_id', type: 'varchar', nullable: true })
  genre_id: string;

  @Column({ name: 'is_free', default: true })
  is_free: boolean;

  @Column({ name: 'is_featured', default: false })
  is_featured: boolean;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'view_count', default: 0 })
  view_count: number;

  @Column({ name: 'sort_order', default: 0 })
  sort_order: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
