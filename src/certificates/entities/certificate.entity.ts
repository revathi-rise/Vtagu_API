import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Movie } from '../../movies/movie.entity';

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'certification_system', length: 100, default: 'CBFC' })
  certification_system: string;

  @Column({ length: 100, default: 'India' })
  country: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'maturity_level', length: 100, nullable: true })
  maturity_level: string;

  @Column({ name: 'badge_color', length: 50, nullable: true, default: '#10B981' })
  badge_color: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => Movie, (movie) => movie.certificate)
  movies: Movie[];
}
