import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ name: 'genre_id', nullable: true })
  genre_id: number;

  @Column({ name: 'age_group', nullable: true })
  age_group: string;

  @Column({ type: 'text', nullable: true })
  actors: string;

  @Column({ nullable: true })
  director: number;

  @Column({ nullable: true })
  year: number;

  @Column({ name: 'country_id', nullable: true })
  country_id: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rating: number;

  @Column({ default: 0 })
  featured: number;
}
