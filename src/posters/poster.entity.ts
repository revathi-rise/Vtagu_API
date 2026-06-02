import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('posters')
export class Poster {
  @PrimaryGeneratedColumn({ name: 'poster_id' })
  poster_id: number;

  @Column({ name: 'poster_title', length: 250, nullable: true })
  poster_title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'genres_list', length: 250, nullable: true })
  genres_list?: string;

  @Column({ length: 250 })
  path: string;

  @Column({ name: 'trailer_url', length: 250, nullable: true })
  trailer_url?: string;

  @Column({ length: 250, nullable: true })
  link?: string;

  @Column({ name: 'languages', length: 250, nullable: true })
  languages?: string;

  @Column({ name: 'page_type', length: 50, nullable: true })
  page_type?: string;

  @Column({ name: 'reference_id', type: 'int', nullable: true })
  reference_id?: number;

  @Column({ name: 'reference_type', length: 50, nullable: true })
  reference_type?: string;

  @Column({ type: 'char', length: 2, default: 'A' })
  status: string;

  @CreateDateColumn({ type: 'datetime', name: 'createdon', nullable: true })
  createdon?: Date;
}
