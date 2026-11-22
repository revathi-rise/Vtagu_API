import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Certificate } from '../../certificates/entities/certificate.entity';

@Entity('series')
export class Series {
  @PrimaryGeneratedColumn()
  series_id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ name: 'description_short', type: 'text', nullable: true })
  description_short: string;

  @Column({ name: 'description_long', type: 'text', nullable: true })
  description_long: string;

  @Column({ name: 'genre_id', type: 'int', nullable: true, default: 0 })
  genre_id: number;

  @Column({ name: 'age_group', type: 'int', nullable: true, default: 0 })
  age_group: number;

  @Column({ type: 'text', nullable: true })
  actors: string;

  @Column({ type: 'int', nullable: true })
  director: number;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ name: 'country_id', type: 'int', nullable: true })
  country_id: number;

  @Column({ nullable: true, default: 'HD' })
  quality: string;

  @Column({ name: 'certificate_id', type: 'int', nullable: true })
  certificate_id: number;

  @ManyToOne(() => Certificate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'certificate_id' })
  certificate?: Certificate;

  @Column({ type: 'int', nullable: true, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  featured: number;

  @Column({ name: 'free', type: 'char', length: 2, default: 'N', nullable: true })
  free: string;

  @Column({ name: 'kids_restriction', type: 'int', default: 0 })
  kids_restriction: number;

  @Column({ name: 'age_restriction', type: 'char', length: 2, default: 'N', nullable: true })
  age_restriction: string;

  @Column({ name: 'episodes', type: 'text', nullable: true })
  episodes: string;

  @Column({ name: 'duration', length: 12, nullable: true })
  duration: string;

  @Column({ name: 'trailer_url', type: 'longtext', nullable: true })
  trailer_url: string;

  @Column({ name: 'series_image', length: 250, nullable: true })
  series_image: string;

  @Column({ name: 'is_coming_soon', default: false })
  is_coming_soon: boolean;
}
