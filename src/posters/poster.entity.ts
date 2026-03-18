import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('posters')
export class Poster {
  @PrimaryGeneratedColumn({ name: 'poster_id' })
  poster_id: number;

  @Column({ length: 250 })
  path: string;

  @Column({ length: 250, nullable: true })
  link?: string;

  @Column({ type: 'char', length: 2, default: 'A' })
  status: string;

  @Column({ type: 'datetime', name: 'createdon', nullable: true })
  createdon?: Date;
}
